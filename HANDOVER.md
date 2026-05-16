# Project Handover - Mesoco IT Asset Management

> Tài liệu bàn giao toàn bộ context dự án. Đọc file này để nắm nhanh: vấn đề kinh doanh, tech stack, cấu trúc repo, scope active, role, module, database, API, lệnh chạy, trạng thái hiện tại và các file tham chiếu.

- **Project name:** Mesoco IT Asset Management (folder cũ giữ tên `mesoco-dental-asset-management`)
- **Repo path:** `D:\CODE\mesoco-dental-asset-management`
- **Default branch:** `main`
- **Git user:** `al-180604`
- **Last verified:** 2026-05-16

---

## 1. Bài Toán Kinh Doanh

Mesoco là công ty công nghệ có lượng tài sản IT (laptop, desktop, monitor, máy in, network device, server, phụ kiện) ngày càng tăng. Quản lý thủ công bằng Excel/giấy gây khó cho:

- Theo dõi vị trí đặt thiết bị và người chịu trách nhiệm.
- Lịch sử bàn giao, bảo trì, kiểm kê.
- Khấu hao, bảo hành, giá trị còn lại.
- Đề xuất thu hủy khi thiết bị quá cũ.

Hệ thống số hóa **vòng đời tài sản IT**: mua sắm -> nhập kho -> gắn QR identity -> bàn giao theo phòng ban / người dùng -> bảo trì -> kiểm kê -> tái phân bổ -> thu hủy/thanh lý.

> Quy tắc nghiệp vụ chốt: depreciation `> 75%` chỉ tạo **đề xuất** thu hủy, không tự động chuyển status. Thu hủy là thao tác có xác nhận của manager/technician.

---

## 2. Scope Active (BẮT BUỘC tuân thủ)

### In scope

- Asset catalog (laptop, desktop, monitor, network, server, peripheral, printer)
- Department/location-based asset management + responsible employee
- Purchase order + supplier management
- Department handover + recovery
- Maintenance + repair logging
- Inventory check + valuation/depreciation/warranty
- Disposal + off-service
- Requests: `JUSTIFICATION` (báo sự cố) + `CONSUMABLE_REQUEST` (xin vật tư)
- Reports + dashboards + RBAC
- QR asset portal (role-aware view)

### Out of scope - KHÔNG được code lại

- Flow mượn/trả tài sản cá nhân kiểu thư viện
- Trang lịch sử tài sản cá nhân
- UI "available for loan"
- Scanner-driven workflow chính
- CRUD hợp đồng nhân viên
- Bất kỳ thuật ngữ domain khác (ví dụ dental/medical) - đã rebrand sang IT

### Legacy compatibility

- KHÔNG rewrite/drop migration lịch sử trong cleanup thông thường.
- Endpoint ngoài scope active phải trả `410 Gone` + JSON message rõ ràng. Không xóa khỏi `routes/api.php`.
- `assets.type` giữ enum generic; phân loại IT đi qua bảng `categories`.

---

## 3. Tech Stack

| Layer | Tech | Vai trò |
|---|---|---|
| Backend | Laravel 12, PHP 8.2 | API, validation, business logic |
| Auth | Laravel Sanctum 4.2 | Đăng nhập bằng `employee_code + password`, session/token API |
| Frontend | React 19, Vite 7 | SPA UI |
| Styling | TailwindCSS 4 | UI styling |
| HTTP | Axios 1.13 | Frontend -> API |
| Router | react-router-dom 7 | Client routing |
| QR | qrcode 1.5 | Render QR client-side |
| DB local | SQLite | Dev/test mặc định |
| DB Docker | MySQL 8.0 (port host `3307`) | Handoff Windows |
| Test | PHPUnit 11 + custom `check:i18n` node script | Backend + i18n parity |
| Dev tools | Laravel Pint, Pail, Sail, Faker, Collision, Mockery | Lint, log, db, factory |

---

## 4. Cấu Trúc Repo

```text
D:\CODE\mesoco-dental-asset-management
├── app/
│   ├── Http/Controllers/    # 20 controller active (Asset, Maintenance, Inventory, PurchaseOrder, ...)
│   ├── Http/Requests/       # Form Request validation
│   └── Models/              # 31 Eloquent model (Asset, Location, AssetAssignment, ...)
├── bootstrap/, config/
├── database/
│   ├── migrations/          # ~40 migrations (KHÔNG rewrite lịch sử)
│   ├── seeders/             # DatabaseSeeder + dữ liệu demo IT
│   └── factories/
├── docker/                  # docker-compose.yml + entrypoint
├── docs/                    # Tài liệu báo cáo/luận văn (xem section 11)
├── public/
├── resources/
│   └── js/
│       ├── pages/           # 17 page React active
│       ├── components/      # Component dùng chung
│       ├── layouts/         # Sidebar.jsx (navigation chính)
│       └── i18n/locales/    # EN/VI, parity check
├── routes/
│   ├── api.php              # API + legacy 410 Gone endpoint
│   ├── web.php
│   └── console.php
├── scripts/                 # docker-setup.bat / docker-start.bat / docker-stop.bat / show-lan-ip.bat
├── storage/, tests/Feature/ # 29 feature test
├── CLAUDE.md, GEMINI.md     # AI agent instructions
├── README.md                # Customer-facing setup (Vietnamese)
├── spec.MD                  # Đặc tả chính thức (Vietnamese)
├── erd_final.md             # SQL Server style ERD nguyên bản (untracked)
├── schema.sql               # Snapshot schema sau migrate
├── raw_spec.md              # Spec gốc dài dòng từ luận văn
├── CHAPTER3_DATABASE_SCHEMA_QUICK_REFERENCE.md
└── trich_xuat_field_erd_ui_thiet_bi.md
```

---

## 5. RBAC - 4 Role Canonical

| Role | Quyền chính |
|---|---|
| `manager` | Quản lý toàn hệ thống, duyệt request/disposal, báo cáo, quản lý user. |
| `technician` | Vận hành asset, maintenance, inventory, purchase order. |
| `employee` | Xem thiết bị mình phụ trách, tạo `JUSTIFICATION`/`CONSUMABLE_REQUEST`. |
| `supplier` | Chỉ xem/cập nhật purchase order thuộc chính supplier đó. Không được seed mặc định. |

**Authentication:** username = `employee_code` (ví dụ `E1001`), không phải email. Email dùng cho profile + forgot-password.

Ma trận quyền đầy đủ: [`docs/RBAC_MATRIX.md`](docs/RBAC_MATRIX.md)

---

## 6. Module Active

| Module | Controller | Page React | Mục đích |
|---|---|---|---|
| Asset Workspace | `AssetController` | `AssetsPage.jsx` | Catalog + global search theo mã/danh mục/vị trí/người giữ |
| Location Catalog | `LocationController` | `LocationsPage.jsx` | Vị trí đặt thiết bị (auto-increment id) |
| Handover | `HandoverController` | `HandoverPage.jsx` | Bàn giao + thu hồi theo phòng ban |
| Maintenance | `MaintenanceEventController` | `MaintenancePage.jsx` | Sự kiện bảo trì + detail xử lý |
| Inventory | `InventoryController` | `InventoryPage.jsx` | Kiểm kê + valuation + warranty |
| Purchase Orders | `PurchaseOrderController` | `PurchaseOrdersPage.jsx` | Đơn mua + line items |
| Suppliers | `SupplierController` | `SuppliersPage.jsx` | Nhà cung cấp |
| Requests | `RequestController` | `RequestsPage.jsx` | `JUSTIFICATION` + `CONSUMABLE_REQUEST` |
| Review Requests | `ReviewRequestController` | `ReviewRequestsPage.jsx` | Manager duyệt/từ chối |
| Disposal | `DisposalController` + `AssetOffServiceController` | `DisposalPage.jsx` | Thu hủy + off-service |
| Reports | `ReportController` | `ReportPage.jsx` | Báo cáo manager |
| QR Portal | `AssetController::resolveQr` + portal route | `QrScanPage.jsx` | Quét QR -> portal role-aware |
| Profile | `ProfileController` | `ProfilePage.jsx`, `ChangePasswordPage.jsx` | Hồ sơ + đổi mật khẩu |
| Dashboard | (multiple) | `Dashboard.jsx` | Tổng quan theo role |
| Shifts / Check-ins | `ShiftController` / `CheckinController` | - | Phụ trợ |
| Feedback | `FeedbackController` | `FeedbackPage.jsx` | Phản hồi |
| Users | `UserController` | - | Manager-only |
| Employees | `EmployeeController` | - | Hồ sơ nhân viên |

Navigation: `resources/js/layouts/Sidebar.jsx`.

---

## 7. Database

### Bảng chính

| Bảng | Vai trò |
|---|---|
| `users` | Tài khoản + role canonical |
| `employees` | Hồ sơ nhân viên nội bộ (có `position`) |
| `suppliers` | Nhà cung cấp |
| `locations` | Vị trí đặt thiết bị, `id` auto-increment (UI dùng), `code` legacy nullable |
| `assets` | Thiết bị (status, location, QR, cost, depreciation, warranty) |
| `categories` | Danh mục IT category |
| `asset_qr_identities` | Lịch sử phát hành QR identity |
| `assignments` + `assignment_details` | Header + lines bàn giao theo `staff_id` (ERD mới) |
| `returns` | Thu hồi cho assignment |
| `asset_assignments` | Mirror compatibility cho flow cũ theo `employee_id` |
| `maintenance_events` + `maintenance_details` | Phiếu bảo trì |
| `repair_logs` | Nhật ký sửa chữa |
| `inventory_checks` + `inventory_check_items` | Kiểm kê |
| `purchase_orders` + `purchase_order_items` | Đơn mua |
| `requests` + `request_items` + `request_events` | Phiếu yêu cầu |
| `disposals` + `disposal_details` | Thu hủy |

### Asset aliases (ERD-new ↔ legacy)

Backend trả song song để FE cũ + mới đều đọc được:

- `assets.serial_number` ↔ `asset_code` (backfilled)
- `assets.qr_code` ↔ `assets.qr_value`
- `assets.purchase_price` ↔ `assets.purchase_cost`
- `assets.current_depreciation_rate` ↔ `assets.depreciation_rate`

### Responsible employee migration

- API `POST /api/assets/{asset}/assign` ưu tiên `staff_id`, vẫn nhận `employee_id` để tương thích.
- Khi chỉ có `employee_id`, backend auto-resolve `users.employee_id` -> tạo `staff_id` theo ERD mới.
- `asset_assignments` ghi song song để các call-site cũ vẫn hoạt động.

### Retire/Dispose effect

```text
assets.status      = retired
assets.location_id = null
assets.location    = null
active assignment  = đóng (cả returns + asset_assignments.unassigned_at)
```

### Convention

- **Migration là source of truth.** `schema.sql` chỉ là export đọc nhanh.
- KHÔNG drop bảng/cột legacy nếu chưa có plan migration phá vỡ tương thích.
- Regenerate schema: `php artisan migrate:fresh --force && php artisan schema:dump`.

Chi tiết: [`docs/DB_CONVENTIONS.md`](docs/DB_CONVENTIONS.md)

---

## 8. QR Asset Portal

Mỗi asset có 3 lớp dữ liệu QR:

- `AssetID` (internal auto-increment)
- `qr_uid` (identity bền vững cho lần regenerate hiện tại) - lưu ở `asset_qr_identities`
- `qr_code`/`qr_value` (payload legacy `MESOCO|ASSET|v1|<uuid>`)

### Dual flow

- **Nhãn vật lý** encode `GET /asset-portal/{qrUid}` -> camera điện thoại mở trực tiếp.
- **Scanner nội bộ** (`POST /api/qr/resolve`) chấp nhận cả portal URL mới VÀ payload legacy.

### Portal data theo role (cùng 1 QR, RBAC ở backend)

| Role | Dữ liệu thấy |
|---|---|
| `employee` | Tên, mã, serial, model, configuration, status, warranty, vị trí, người giữ |
| `technician` | + last maintenance, repair logs, depreciation rate, remaining value |
| `manager` | + purchase price, purchase date, supplier contact |

Tương ứng view báo cáo `View_AssetPortal_Full` (compose ở controller để áp RBAC live).

Endpoints active:

- `POST /api/qr/resolve` — manager/technician/employee
- `POST /api/assets/{asset}/regenerate-qr` — manager/technician
- `GET /asset-portal/{qrUid}` — read-only, bắt buộc login (redirect `/login?redirect=...`)

Chi tiết: [`docs/QR_FEATURE_GUIDE.md`](docs/QR_FEATURE_GUIDE.md)

### Test QR LAN

Khi test QR bằng điện thoại, `localhost` của laptop ≠ `localhost` của điện thoại. Script Docker tự tìm IP LAN của laptop và inject vào QR:

```text
http://192.168.x.x:8000/asset-portal/<qr_uid>
```

Override thủ công: `$env:MESOCO_HOST_IP = "192.168.123.5"; scripts\docker-start.bat`

---

## 9. Legacy Endpoints (410 Gone)

| Endpoint | Hành vi |
|---|---|
| `/api/my-assets` | `410` |
| `/api/my-asset-history*` | `410` |
| `/api/assets/available-for-loan` | `410` |
| `/api/employees/{employee}/contracts` | `410` |
| `/api/contracts/{contract}*` | `410` |

Trả JSON message rõ ràng (không HTML SPA) để client cũ biết lý do.

---

## 10. Lệnh Phát Triển

### Local

```powershell
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve     # http://localhost:8000
npm run dev           # http://localhost:5173
```

### Docker (recommended cho Windows)

```powershell
cd D:\CODE\mesoco-dental-asset-management
scripts\docker-setup.bat   # Lần đầu - build + migrate + seed
scripts\docker-start.bat   # Lần sau
scripts\docker-stop.bat
scripts\docker-reset.bat   # Reset sạch DB
scripts\show-lan-ip.bat    # Lấy IP LAN cho QR test
```

Port mapping: app `8000`, vite `5173`, MySQL host `3307`.

### Kiểm tra (bắt buộc trước khi commit/PR)

```powershell
npm run check:i18n   # i18n EN/VI key parity
npm run build        # FE production build
php artisan test     # Backend feature tests
```

### Tài khoản demo (sau seed)

| Role | Username | Email | Password |
|---|---|---|---|
| manager | `E1001` | `manager@mesoco.vn` | `password` |
| technician | `E1002` | `technician@mesoco.vn` | `password` |
| employee | `E1003` | `employee@mesoco.vn` | `password` |
| employee | `E1004` | `frontdesk@mesoco.vn` | `password` |
| employee | `E1005` | `warehouse@mesoco.vn` | `password` |

Supplier không được seed - tạo riêng nếu test luồng supplier.

Chi tiết: [`docs/SEED_DATA.md`](docs/SEED_DATA.md)

---

## 11. Tài Liệu (`docs/`)

| File | Nội dung |
|---|---|
| [`docs/README.md`](docs/README.md) | Index docs + mô tả bài toán |
| [`docs/STACK.md`](docs/STACK.md) | Tech stack + runtime flow + lệnh chạy |
| [`docs/BFD.md`](docs/BFD.md) | Business Flow Diagram - 6 phân hệ + mapping sang sidebar |
| [`docs/RBAC_MATRIX.md`](docs/RBAC_MATRIX.md) | Ma trận quyền 4 role × các module |
| [`docs/ROLE_FEATURES.md`](docs/ROLE_FEATURES.md) | Tính năng nhìn từ từng người dùng |
| [`docs/DB_CONVENTIONS.md`](docs/DB_CONVENTIONS.md) | Quy ước DB, bảng chính, alias ERD, legacy compatibility |
| [`docs/QR_FEATURE_GUIDE.md`](docs/QR_FEATURE_GUIDE.md) | QR portal + role-aware view + cách test LAN |
| [`docs/SEED_DATA.md`](docs/SEED_DATA.md) | Tài khoản demo + dữ liệu seed |
| [`docs/CLASS_DIAGRAM.md`](docs/CLASS_DIAGRAM.md) | Mermaid class diagram |
| [`docs/feat_role.md`](docs/feat_role.md) | Checklist nghiệm thu (1 item smoke test còn pending) |
| [`docs/CUSTOMER_DOCKER_SETUP.md`](docs/CUSTOMER_DOCKER_SETUP.md) | Hướng dẫn copy-paste cho khách trên Windows |
| [`docs/DEVICE_LOGIC_FIX_SCREENSHOTS.md`](docs/DEVICE_LOGIC_FIX_SCREENSHOTS.md) | Screenshot trước/sau fix device logic |
| `docs/screenshots/device-logic-2026-05-14/` | Snapshot 14/05 |
| `docs/screenshots/device-logic-2026-05-15/` | Snapshot 15/05 (sau fix) |
| `docs/superpowers/plans/2026-04-25-it-asset-doc-alignment-plan.md` | Plan tài liệu trước đây |

### Tài liệu nguồn (root, không phải `docs/`)

| File | Mục đích |
|---|---|
| `README.md` | Setup customer-facing (tiếng Việt, Docker-first) |
| `CLAUDE.md` | Project instructions cho Claude Code agent |
| `GEMINI.md` | Project instructions cho Gemini agent (English) |
| `spec.MD` | Đặc tả chính thức (17.7KB, tiếng Việt) |
| `erd_final.md` | ERD nguyên bản dạng SQL Server (untracked) |
| `schema.sql` | Snapshot schema sau `migrate:fresh` |
| `raw_spec.md` | Spec gốc dài (186KB) từ luận văn |
| `CHAPTER3_DATABASE_SCHEMA_QUICK_REFERENCE.md` | Quick reference schema (19KB) |
| `trich_xuat_field_erd_ui_thiet_bi.md` | Trích xuất field ERD ↔ UI thiết bị (29KB) |
| `KLTN_DamThiNguyen_15.05.2026.docx (2).pdf` | Luận văn 4.3MB |
| `need2fix.pdf` | Danh sách cần fix (2.1MB, untracked) |
| `overall_req.pdf` | Yêu cầu tổng quan (5.1MB, untracked) |

---

## 12. Trạng Thái Hiện Tại

### Git

- Branch: `main`
- 5 commit gần nhất:
  - `6001e5d` Fix device management business logic and UI
  - `33776a1` fix: harden docker setup dependencies
  - `6a948a5` feat: improve QR local access and demo build
  - `fe149db` Prevent duplicate demo QR identities
  - `8cfe217` Fix QR scan UI and seed demo data
- Untracked: `erd_final.md`, `need2fix.pdf`, `overall_req.pdf`
- Không có change đang staged.

### Nghiệm thu (`docs/feat_role.md`)

Hoàn thành:

- Asset catalog (category, valuation, status, workspace search/filter)
- Location (code/name/description, unique code, asset linkage)
- Responsible employee (assign API, RBAC, dropdown alias)
- Maintenance (types vận hành thiết bị, technician, cost)
- Requests (JUSTIFICATION + CONSUMABLE_REQUEST, manager review)
- Inventory & valuation (depreciation, warranty, dashboard)
- Disposal (75% threshold không tự retire; retire clear location + assignment)
- Purchase order (manager/technician CRUD, supplier scope)
- Legacy 410 Gone
- Test/build: `php artisan test`, `npm run check:i18n`, `npm run build`, `git diff --check`

Còn lại:

- [ ] Smoke test end-to-end manual: tạo location -> tạo asset -> assign -> employee thấy -> retire -> location/assignment biến mất.

### Memory snapshot

- **`project_bfd.md`** (46 ngày): BFD 5 nhóm + rule khấu hao 70% (lưu ý: spec hiện tại dùng **75%** - memory cũ).
- **`user_profile.md`** (46 ngày): user collaborate với stakeholder Nguyen, communicate Vietnamese.

---

## 13. Quy Tắc Kỹ Thuật Bắt Buộc (từ `CLAUDE.md`)

1. **Không** đổi tên repo hoặc bảng/cột lịch sử nếu không có migration riêng.
2. **Không** drop migration cũ trong cleanup thông thường.
3. **Không** đưa lại flow mượn/trả cá nhân hoặc quét mã cá nhân vào UI active.
4. Legacy API ngoài scope phải trả JSON `410 Gone`.
5. `assets.type` giữ enum generic; phân loại IT dùng `category`.
6. Request active chỉ gồm `JUSTIFICATION` và `CONSUMABLE_REQUEST`.
7. Sau khi sửa text/i18n key, **luôn** chạy `npm run check:i18n`.
8. Nếu đổi nghiệp vụ hoặc public API, **cập nhật `docs/` cùng commit**.

### Windows shell safety (PowerShell)

- KHÔNG dùng bash heredoc `<<'EOF'` trong PowerShell.
- Multi-line PHP -> dùng here-string + `Set-Content` + `docker compose exec -T app php artisan tinker`.
- Hoặc `docker compose exec -T app php artisan tinker --execute="..."` cho snippet ngắn.

---

## 14. Quick Start Cho Người Tiếp Nhận

```powershell
# 1. Lấy code
cd D:\CODE
git clone <repo-url> mesoco-dental-asset-management
cd mesoco-dental-asset-management

# 2. Đọc tài liệu (theo thứ tự)
#    README.md (customer setup)
#    HANDOVER.md (file này)
#    CLAUDE.md / GEMINI.md (agent rules)
#    docs/README.md -> docs/STACK.md -> docs/BFD.md -> docs/RBAC_MATRIX.md -> docs/DB_CONVENTIONS.md
#    spec.MD (đặc tả chính thức)

# 3. Bật app
scripts\docker-setup.bat       # Lần đầu
# hoặc
scripts\docker-start.bat       # Lần sau

# 4. Truy cập
start http://localhost:8000
# Login: E1001 / password (manager)

# 5. Verify lành mạnh
docker compose -f docker/docker-compose.yml exec app php artisan test
npm run check:i18n
npm run build
```

---

## 15. Liên Hệ / Người Phụ Trách

- **Developer:** al-180604 (`leducanh180604@gmail.com`)
- **Stakeholder nghiệp vụ:** Đàm Thị Nguyên (Nguyên) - cung cấp requirement, confirm naming BFD ("Thu hủy" not "thanh lý", "Phiếu cấp phát" not "phiếu yêu cầu")
- **Ngôn ngữ làm việc:** Vietnamese
