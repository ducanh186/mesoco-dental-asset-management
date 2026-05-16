# Audit Report — need2fix.pdf Alignment

> Ngày: 2026-05-16
> Người làm: AI agent theo lệnh user
> Trạng thái: **AUDIT ONLY** — chưa sửa code, chưa commit, chưa push
> Scope guard: HANDOVER.md, spec.MD, CLAUDE.md, docs/RBAC_MATRIX.md, docs/DB_CONVENTIONS.md, docs/BFD.md, routes/api.php

## 0. Hard Scope Guards (luôn áp dụng)

Mọi đề xuất bên dưới phải tuân:

- Không khôi phục flow mượn/trả cá nhân kiểu thư viện.
- Không khôi phục UI/API "available for loan".
- `GET /api/my-assets`, `/api/my-asset-history*`, `/api/assets/available-for-loan`, `/api/employees/{employee}/contracts*`, `/api/contracts/{contract}*` phải tiếp tục trả `410 Gone` (routes/api.php:81-140).
- Không rewrite/drop migration lịch sử.
- `assets.type` giữ enum generic (`equipment`); phân loại IT đi qua `categories`.
- Request type active **chỉ** `JUSTIFICATION` và `CONSUMABLE_REQUEST`. Nếu need2fix yêu cầu hiển thị "Bàn giao / Thu hồi / Sửa chữa / Thu hủy" trong UI, xử lý như **display category** (nguồn từ handover/return/maintenance/disposal workflows), **không** thêm enum mới trong DB.
- Depreciation `> 75%` chỉ tạo đề xuất thu hủy (không tự retire). Đã đúng theo `docs/feat_role.md:55-56`.
- Nếu đổi public API hoặc business behavior → cập nhật `docs/` cùng commit.

---

## 1. Sidebar / Navigation

### Hiện trạng (resources/js/layouts/Sidebar.jsx)

- `Dashboard` (Tổng quan) đứng đầu menu chính ✅ (Sidebar.jsx:144, 179, 213, 223)
- Manager + technician dùng cấu trúc nhóm BFD:
  - `bfd-catalog`, `bfd-orders`, `bfd-operations`, `bfd-maintenance`, `bfd-inventory-disposal`, `bfd-records`, `bfd-reports` (Sidebar.jsx:143-210)
- `qrScan` nằm trong `bfd-operations` (nhóm) → bị 1 cấp con (Sidebar.jsx:154, 189)
- `reviewRequests` nằm trong `bfd-operations` cho manager (Sidebar.jsx:156). Technician không có (đúng vì technician không duyệt).
- Tất cả label nhóm dùng key `nav.bfdCatalog`, `nav.bfdOperations`, …

### Vấn đề so với need2fix

- Need2fix muốn `Quét QR` là **mục chính dưới Tổng quan** (top-level item), không lồng trong BFD group.
- Need2fix muốn `Phê duyệt phiếu yêu cầu` là **mục chính** (top-level), không lồng.
- Need2fix nói không để "Sơ đồ chức năng BFD" trong UI vận hành. Hiện sidebar đang **dùng tên nhóm BFD** làm section header (`Khối danh mục`, `Khối đơn hàng`, …). Việc bám BFD ở backend OK, nhưng wording label cần cân nhắc.
- HANDOVER.md mục 13 không có rule trực tiếp, nhưng `docs/BFD.md:5` viết "Sidebar web chỉ hiển thị chức năng vận hành, không hiển thị BFD như một module người dùng." → mâu thuẫn nhẹ với chính sidebar hiện tại.

### Đề xuất

| Hành động | File | Safety |
|---|---|---|
| Đưa `qrScan` thành item top-level cho manager/technician/employee (giữ vị trí ngay sau dashboard) | `resources/js/layouts/Sidebar.jsx` ~L143-235 | **Safe** |
| Đưa `reviewRequests` thành item top-level cho manager | `resources/js/layouts/Sidebar.jsx` ~L143-176 | **Safe** |
| Đổi label nhóm: bỏ tiền tố "BFD"/"Khối" trong tên hiển thị, đổi sang wording vận hành ("Danh mục", "Vận hành", …). i18n `nav.bfd*` keys cập nhật trong `resources/js/i18n/locales/en.js` + `vi.js`. **Bắt buộc chạy** `npm run check:i18n` sau khi đổi. | `resources/js/i18n/locales/en.js`, `vi.js`, `Sidebar.jsx` (labelKey) | **Safe** |
| Giữ `bfd-records` không đổi vì là menu "Hồ sơ" thực tế, chỉ đổi label | i18n | **Safe** |

**Backend impact:** None.
**Frontend impact:** Reorder + label/i18n.
**Test plan:** `npm run check:i18n`, smoke test sidebar trên manager/technician/employee/supplier.
**Docs update:** `docs/BFD.md` mapping table (line 47-57) cập nhật nếu vị trí mục đổi.

---

## 2. Catalog — Locations

### Hiện trạng (resources/js/pages/LocationsPage.jsx)

- Form modal có: `name` (required), `description` (optional), `is_active` (chỉ khi edit). LocationsPage.jsx:43-47
- Table columns: `id` (Mã vị trí), `name`, `description`, actions. LocationsPage.jsx:178-228
- DB `locations` có `code` nullable + `id` auto-increment (docs/DB_CONVENTIONS.md:41-49). UI active không hỏi `code`.
- Filter có hardcoded `areaOptions` ("Kho tầng 1", "Khu HR", …) không liên kết với DB (LocationsPage.jsx:83-92).

### Vấn đề so với need2fix

- need2fix muốn: chỉ dùng `Mã vị trí`, `Tên vị trí`, `Mô tả`. Đã 95% đạt.
- Phần `areaOptions` hardcoded là noise — không phản ánh dữ liệu thực, có thể bỏ filter này hoặc thay bằng filter dữ liệu thật.

### Đề xuất

| Hành động | File | Safety |
|---|---|---|
| Bỏ filter `areaFilter` (areaOptions hardcoded) khỏi UI để chỉ giữ tìm theo từ khóa + checkbox inactive | `LocationsPage.jsx:83-92, 247-278` | **Safe** |
| Giữ nguyên DB columns `code`, `address` (legacy) — không drop | migrations | **DO NOT TOUCH** |
| Đảm bảo `LocationController` không yêu cầu `code` khi store | `app/Http/Controllers/LocationController.php` + `app/Http/Requests/StoreLocationRequest.php` | **Needs confirmation** (cần audit Request file) |

**Backend impact:** Validation chỉ cần verify không bắt buộc `code`.
**Frontend impact:** Xoá block filter areaFilter.
**Test plan:** Feature test cho create/update location bằng minimal payload `{name, description}`.
**Docs update:** Không cần (đã đúng `docs/DB_CONVENTIONS.md`).

---

## 3. Catalog — Asset Categories

### Hiện trạng (resources/js/pages/AssetsPage.jsx)

- `deviceCategories` (AssetsPage.jsx:95-110) gồm 14 option: PC, Màn hình, Thiết bị Test, Phụ kiện dùng, Linh kiện thay thế, RAM, SSD, HDD, Tai nghe, Adapter, Cáp kết nối, Mainboard, Bộ nguồn.
- `assetStatuses` (AssetsPage.jsx:112-119) gồm: available, assigned, maintenance, inventorying, retired.

### Vấn đề so với need2fix

- need2fix muốn **thống nhất 5 danh mục**: `PC`, `Màn hình`, `Thiết bị Test`, `Phụ kiện dùng`, `Linh kiện thay thế`. Các option phụ (RAM, SSD, HDD, Tai nghe, Adapter, Cáp kết nối, Mainboard, Bộ nguồn) là chi tiết của "Phụ kiện dùng"/"Linh kiện thay thế" → nên gom lại.
- need2fix có mâu thuẫn về `Đang kiểm kê`: lúc ghi là asset status, lúc ghi "làm gì có trạng thái kiểm kê". Hiện code có `inventorying` (AssetsPage.jsx:117) + summary card "Đang kiểm kê" (AssetsPage.jsx:747).

### Đề xuất

| Hành động | File | Safety |
|---|---|---|
| Thu gọn `deviceCategories` về 5 option chính. Các option chi tiết (RAM, SSD…) chuyển sang `Phụ kiện dùng` hoặc `Linh kiện thay thế`. | `AssetsPage.jsx:95-110` + i18n nếu có | **Safe — but needs confirmation** (Có dữ liệu seed/demo dùng category cũ. Phải audit `DatabaseSeeder` và assets thực để mapping chuẩn — KHÔNG được làm break test/seed) |
| `inventorying` status: **KHÔNG xóa khỏi enum** vì còn trong DB/migration/test. Chỉ **ẩn khỏi dropdown filter và summary card** ở UI active để phản ánh "kiểm kê là đợt, không phải status của asset". | `AssetsPage.jsx:117, 747` + có thể cả `InventoryPage.jsx` | **Needs confirmation** — quyết định nghiệp vụ cuối cùng từ stakeholder Nguyên |

**Backend impact:** Không thay enum DB.
**Frontend impact:** Thu category list; có thể ẩn `inventorying` UI.
**Test plan:** `php artisan test` (đảm bảo assertion không hardcode kỳ vọng option list), `npm run build`.
**Docs update:** `docs/feat_role.md:7` ("Asset có category như Laptop, Desktop, Monitor, Network, Server, Peripheral, Printer.") cần cập nhật về 5 category mới NẾU thay đổi được duyệt.

---

## 4. Asset Workspace — Filter

### Hiện trạng (resources/js/pages/AssetsPage.jsx)

- Filter row có: search input, `categoryFilter`, `statusFilter`, `locationFilter`, "Xóa bộ lọc" button (AssetsPage.jsx:754-790).
- Button "Xóa bộ lọc" đã ngang hàng với filter ✅.
- Search input helper text (line 760): `"Tìm theo mã thiết bị, serial, QR, model, vị trí và người phụ trách"`.

### Vấn đề so với need2fix

- need2fix muốn **bỏ** dòng "Tra cứu nhanh theo người giữ…". Helper text hiện tại có "người phụ trách" — cần xóa phần này hoặc giữ ngầm.
- Cấu trúc filter còn lại đã đúng need2fix.

### Đề xuất

| Hành động | File | Safety |
|---|---|---|
| Đổi helper text search input bỏ "người phụ trách" | `AssetsPage.jsx:760` | **Safe** |
| Giữ logic backend (vẫn cho tìm theo người phụ trách dưới capot) — chỉ thay placeholder/helper hiển thị | None | **Safe** |

**Backend impact:** None.
**Frontend impact:** Đổi text + i18n nếu có.
**Test plan:** `npm run check:i18n`, smoke filter trang asset.
**Docs update:** Không.

---

## 5. Catalog — Suppliers

### Hiện trạng (resources/js/pages/SuppliersPage.jsx)

- Form modal có: `code`, `name` (required), `contact_person`, `phone`, `email`, `address`, `note` (SuppliersPage.jsx:13-21, 256-328).
- Table columns: `code`, `name`, `contact_person`, `phone`, `email`, `address`, actions. SuppliersPage.jsx:149-202
- **Thiếu**: column `note` không hiển thị trong list (chỉ có trong modal).

### Vấn đề so với need2fix

- need2fix muốn: tất cả field trong popup phải có trong bảng/list/detail. Hiện list thiếu `note`.

### Đề xuất

| Hành động | File | Safety |
|---|---|---|
| Thêm column `note` vào bảng (có thể truncate hoặc tooltip để không phá layout) | `SuppliersPage.jsx:149-202` | **Safe** |
| Hoặc thêm "Chi tiết" modal đầy đủ field + danh sách columns gọn hơn | `SuppliersPage.jsx` | **Safe — preferred** (matches PO pattern need2fix muốn: list ngắn, detail đầy đủ) |
| Verify `SupplierController` trả tất cả field này | `app/Http/Controllers/SupplierController.php` | **Audit** |

**Backend impact:** None nếu controller đã trả đủ field.
**Frontend impact:** Thêm column hoặc detail modal.
**Test plan:** `php artisan test`, smoke test supplier CRUD.
**Docs update:** Không.

---

## 6. Purchase Orders

### Hiện trạng

**Frontend (resources/js/pages/PurchaseOrdersPage.jsx):**

- Status enum hiển thị 3 giá trị: `preparing`, `shipping`, `delivered` (PurchaseOrdersPage.jsx:36-59, 82-83).
- 4 summary cards: Total, Chuẩn bị, Đang giao, Giao thành công (PurchaseOrdersPage.jsx:408-425).
- Form create gồm 2 khối:
  - Khối 1: Nhà cung cấp + Ghi chú (PurchaseOrdersPage.jsx:478-504)
  - Khối 2: Danh sách thiết bị (`item_name`, `unit`, `qty`, `note`) (PurchaseOrdersPage.jsx:506-575)
  - **KHÔNG có unit_price trong UI create** ✅
- List action cho operational role: `Sửa`, `Xóa` (PurchaseOrdersPage.jsx:357-370). Không có nút `Chi tiết`.
- Delete confirm: `window.confirm('Xóa đơn hàng …')` (PurchaseOrdersPage.jsx:204).
- Sau khi create, chỉ `toast.success('Tạo đơn hàng thành công')` (PurchaseOrdersPage.jsx:293) — KHÔNG có message "đã gửi email cho nhà cung cấp".

**Backend (app/Http/Controllers/PurchaseOrderController.php):**

- 3 status: `STATUS_PREPARING`, `STATUS_SHIPPING`, `STATUS_DELIVERED` (PurchaseOrderController.php:59-61).
- `unit_price`, `line_total` đã nullable trong `syncItems` (PurchaseOrderController.php:217-227) ✅ — backend đã sẵn sàng cho mô hình giá-sau-giao-hàng.
- `payment_method` vẫn được giữ trong store/update payload + search filter (PurchaseOrderController.php:22-26, 88-89, 124-125). Phù hợp với HANDOVER guard "không drop column legacy".
- Không có notification dispatch khi create.

### Vấn đề so với need2fix

| Yêu cầu need2fix | Trạng thái |
|---|---|
| Chỉ 2 status: Chờ giao hàng, Giao hàng thành công | **Lệch** — hiện 3 status |
| Form create không yêu cầu unit_price | ✅ Đã đúng |
| Bảng list chỉ có "Chi tiết" | **Lệch** — hiện Sửa/Xóa trong list |
| Edit/Delete trong detail modal | **Lệch** — hiện không có detail modal độc lập |
| Confirm xóa "Bạn chắc chắn muốn xóa?" | ✅ Có confirm |
| Show message đã gửi email cho NCC sau khi tạo | **Thiếu** |

### Đề xuất

| Hành động | File | Safety |
|---|---|---|
| **Status enum:** Quyết định cách triển khai 2-vs-3. Khuyến nghị: giữ `preparing` ngầm như giai đoạn "Draft chuẩn bị gửi", UI hiển thị 2 trạng thái user-facing: `Chờ giao hàng` (gom `preparing` + `shipping`) và `Giao hàng thành công` (`delivered`). Hoặc xóa `shipping` khỏi flow nếu doanh nghiệp không cần. **Cần confirm từ Nguyên trước khi sửa.** | `PurchaseOrder` model, `PurchaseOrderController`, `PurchaseOrdersPage.jsx`, migrations check | **Needs confirmation** |
| Đổi list action: thay `Sửa` + `Xóa` bằng `Chi tiết` (open detail modal). Đặt `Sửa`/`Xóa` trong detail modal. Supplier vẫn thấy "Chuyển sang giao" / "Xác nhận giao xong" hoặc đặt trong detail | `PurchaseOrdersPage.jsx:352-388` + thêm detail modal mới | **Safe** |
| Thêm `PurchaseOrderCreated` notification dispatch trong `store()` (Laravel Mail/Notification chuẩn, fallback `log` mailer). UI toast hiển thị "Đã gửi thông báo tới nhà cung cấp" | `PurchaseOrderController.php:77-107` + `app/Notifications/PurchaseOrderCreated.php` (mới) + i18n + queue config (nếu có) | **Safe** — chỉ thêm |
| **KHÔNG drop** cột `unit_price`, `line_total`, `payment_method`, `total_amount` trong DB | migrations | **DO NOT TOUCH** |

**Backend impact:** Thêm notification class, có thể normalize status logic.
**Frontend impact:** Tách detail modal, thu gọn status options trong UI.
**Test plan:**
- Feature test: `tests/Feature/PurchaseOrderTest.php` (nếu có) phải pass với status mapping mới + notification fake.
- Test mail/notification queue.
- `npm run check:i18n`, `npm run build`, `php artisan test`.
**Docs update:** `docs/RBAC_MATRIX.md:16`, `docs/feat_role.md:62-66` cập nhật status enum nếu thay đổi được duyệt.

---

## 7. Requests & Review Requests

### Hiện trạng

- `requests` table có request types active: `JUSTIFICATION`, `CONSUMABLE_REQUEST` (docs/DB_CONVENTIONS.md:120-123).
- Route: `Route::get('/requests')`, `Route::post('/requests')`, `Route::get('/requests/{id}')`, `Route::post('/requests/{id}/cancel')` cho cả manager/technician/employee. (routes/api.php:108-111)
- Route manager-only: `/review-requests`, `/requests/{id}/review` (routes/api.php:153-154).

### Vấn đề so với need2fix

- need2fix muốn 3 status approval hiển thị: `Chờ duyệt`, `Đã duyệt`, `Không duyệt`. **Cần verify** request status enum hiện tại trong model `AssetRequest`.
- need2fix muốn list chỉ có `Chi tiết`, duyệt/từ chối trong detail. **Cần verify** UI hiện tại (chưa đọc RequestsPage.jsx + ReviewRequestsPage.jsx trong audit này, **đề xuất audit riêng** trước khi sửa).
- need2fix nói employee/technician chỉ xem phiếu của mình ở màn hình "phiếu của tôi". Đúng theo `RequestController::index` scope (cần verify).
- need2fix có gợi ý "Loại phiếu: Bàn giao, Thu hồi, Sửa chữa, Thu hủy" — **PHẢI xử lý như display category nguồn từ handover/return/maintenance/disposal workflow, KHÔNG thêm enum mới vào `requests.type`**. Đây là hard guard từ HANDOVER mục 2 + spec.MD mục 6.7.

### Đề xuất

| Hành động | File | Safety |
|---|---|---|
| Audit `RequestsPage.jsx` + `ReviewRequestsPage.jsx` chi tiết về status display, list action, detail modal | `resources/js/pages/RequestsPage.jsx`, `ReviewRequestsPage.jsx` | **Audit cần ở phase implement** |
| Audit `App\Models\AssetRequest` (hoặc `Request`) cho status enum hiện hành | `app/Models/` | **Audit cần** |
| **KHÔNG** thêm enum mới vào `requests.type` cho "Bàn giao/Thu hồi/Sửa chữa/Thu hủy". Thay vào đó tạo view tổng hợp trong `ReviewRequestsPage` đọc từ nhiều bảng (handover, returns, maintenance proposals, disposal proposals) | `app/Http/Controllers/ReviewRequestController.php` (mở rộng) | **Needs confirmation** — quyết định kiến trúc lớn |
| Đổi list action sang chỉ `Chi tiết`, đưa duyệt/từ chối vào detail modal | `RequestsPage.jsx`, `ReviewRequestsPage.jsx` | **Safe (sau audit)** |

**Backend impact:** Có thể cần aggregate query mới (chỉ đọc, không sửa schema).
**Frontend impact:** Refactor list/detail UX.
**Test plan:** Test approval workflow, RBAC scope (employee không thấy của người khác).
**Docs update:** `docs/feat_role.md:41-43`, `docs/RBAC_MATRIX.md:17-18`.

---

## 8. Handover / Return

### Hiện trạng

- `HandoverPage.jsx` tồn tại (Sidebar.jsx:50-55).
- `HandoverController::index` route active (routes/api.php:188).
- `AssetController::assign` / `unassign` route active (routes/api.php:185-186).
- DB bảng: `assignments` + `assignment_details` (ERD mới), `returns` (thu hồi), `asset_assignments` (mirror legacy) (docs/DB_CONVENTIONS.md:24-26).
- AssetsPage cho phép bàn giao + thu hồi qua nút "Bàn giao"/"Thu hồi" (AssetsPage.jsx:691-704). Nhưng nút "Thu hồi" hiện chỉ mở `ConfirmModal` đơn giản (AssetsPage.jsx:1236-1244) **KHÔNG bắt buộc nhập tình trạng thiết bị**.

### Vấn đề so với need2fix

| Yêu cầu need2fix | Trạng thái |
|---|---|
| Tách handover và return UI rõ ràng | **Cần verify** `HandoverPage.jsx` |
| Sau thu hồi, asset KHÔNG dùng status "Thu hồi"; phải về "Sẵn sàng" | **Cần verify** `unassign` logic backend |
| Thu hồi phải có field "Tình trạng thiết bị lúc thu hồi" not null | **Lệch** — `ConfirmModal` hiện không có input này |
| List chỉ "Chi tiết", action trong detail | **Cần verify** `HandoverPage.jsx` |
| Không khôi phục flow mượn/trả cá nhân | **Hard guard** từ HANDOVER |

### Đề xuất

| Hành động | File | Safety |
|---|---|---|
| Audit `HandoverPage.jsx` chi tiết | `resources/js/pages/HandoverPage.jsx` | **Audit cần** |
| Đổi `confirmUnassignOpen` flow ở AssetsPage thành modal đầy đủ với field `return_condition` (required) và `note` | `AssetsPage.jsx:1236-1244` + `handleUnassignAsset` + `AssetController::unassign` validation + `returns.reason`/`returns.condition` column (audit existence) | **Needs confirmation** — có thể cần thêm column `return_condition` vào `returns` table (audit migration `returns` schema trước) |
| Verify `unassign` chuyển asset về status `available` (không tạo status mới như "returned") | `app/Http/Controllers/AssetController.php::unassign` | **Audit** |
| **KHÔNG** thay đổi semantics của `/api/my-assets` (vẫn 410) | routes/api.php | **DO NOT TOUCH** |

**Backend impact:** Có thể cần migration mới thêm `return_condition` (KHÔNG drop column cũ).
**Frontend impact:** Replace simple confirm modal bằng form modal có required field.
**Test plan:** Feature test return flow, assert asset.status = active sau khi thu hồi, assert `returns.return_condition` not null.
**Docs update:** `docs/feat_role.md` section Responsible Employee + `docs/DB_CONVENTIONS.md` section Responsible Employee.

---

## 9. "Thiết bị của tôi" — Conflict Resolution

### Vấn đề

- need2fix muốn technician/employee có trang "Thiết bị của tôi" để tạo phiếu sửa chữa, bàn giao/thu hồi.
- HANDOVER + spec đang chốt `/api/my-assets` phải `410 Gone`, "Trang lịch sử tài sản cá nhân" là out-of-scope.

### Giải pháp an toàn (tuân scope guard)

| Hành động | File | Safety |
|---|---|---|
| Tạo trang "Thiết bị của tôi" dưới dạng **filtered view của Asset Workspace** dùng endpoint hiện có `/api/my-assigned-assets/dropdown` (routes/api.php:91) hoặc filter `/api/assets?assigned_to=me` | `resources/js/pages/`, có thể tận dụng `AssetsPage.jsx` với prop filter | **Safe** |
| **KHÔNG** bật lại `/api/my-assets` | routes/api.php | **DO NOT TOUCH** |
| **KHÔNG** tạo "Trang lịch sử tài sản cá nhân" độc lập | None | **DO NOT TOUCH** |
| Trên trang "Thiết bị của tôi", các action vẫn đi qua API hiện có: `POST /api/requests` (cho JUSTIFICATION sự cố), `POST /api/maintenance-events` nếu là technician. Employee không tạo bàn giao trực tiếp; gửi request type `JUSTIFICATION` để manager/technician xử lý | API hiện có | **Safe** |

**Backend impact:** None nếu dùng API hiện có; có thể thêm filter param `?assigned_to=current`.
**Frontend impact:** New page hoặc filtered mode của AssetsPage.
**Test plan:** Employee login thấy chỉ asset của mình; technician thấy asset của mình + có thể tạo maintenance.
**Docs update:** `docs/ROLE_FEATURES.md` thêm flow.

---

## 10. Quyền xem Purchase Orders

### Vấn đề

- HANDOVER + RBAC_MATRIX hiện cho technician CRUD/xem tất cả PO (`docs/RBAC_MATRIX.md:16`, routes/api.php:201-205).
- need2fix latest (16/5) ghi technician/employee không xem đơn hàng, chỉ manager xem.

### Đề xuất

| Hành động | File | Safety |
|---|---|---|
| **Cần stakeholder Nguyên confirm** quyết định cuối: ẩn PO khỏi technician hay giữ? | None — chờ confirm | **Needs confirmation — BLOCKING** |
| Nếu ẩn khỏi technician: chuyển `Route::middleware('role:manager,technician')->group()` cho block PO write (line 204-206) sang `role:manager`. Block read (line 225-227) giữ supplier scope. Sidebar `purchaseOrders` ẩn khỏi technician's `bfdItems` (Sidebar.jsx:178-210) | `routes/api.php`, `Sidebar.jsx`, frontend role checks | **Safe (sau khi confirm)** |
| **Giữ** supplier scope (xem PO của chính supplier) — vẫn là role canonical | routes/api.php:224-228 | **DO NOT TOUCH** |

**Backend impact:** Đổi middleware route, có thể đổi policy `PurchaseOrderPolicy`.
**Frontend impact:** Ẩn menu + redirect 403.
**Test plan:** Feature test 4 role với PO endpoints.
**Docs update:** `docs/RBAC_MATRIX.md:16`, `docs/feat_role.md:62-66`, `docs/ROLE_FEATURES.md`.

---

## 11. Trạng thái "Đang kiểm kê"

### Vấn đề

- Code hiện có `inventorying` trong `assetStatuses` (AssetsPage.jsx:117) + summary card "Đang kiểm kê" (AssetsPage.jsx:747).
- need2fix mâu thuẫn nội bộ.

### Phân tích

- "Kiểm kê" về nghiệp vụ thuộc về **đợt kiểm kê** (`inventory_checks`), không phải status của asset.
- Tuy nhiên, trong một số workflow asset bị khóa khi đang kiểm kê (off-service tạm thời). DB có thể đã dùng cho mục đích này.

### Đề xuất

| Hành động | File | Safety |
|---|---|---|
| **KHÔNG** xóa enum khỏi DB/migration | migrations | **DO NOT TOUCH** |
| Audit chỗ nào set `status = inventorying`: grep `'inventorying'` trong `app/`, `database/seeders/` | None — audit cần | **Audit cần ở phase implement** |
| Nếu không có business workflow đang set, **ẩn khỏi UI**: bỏ option khỏi `assetStatuses` dropdown (AssetsPage.jsx:117) và bỏ summary card (AssetsPage.jsx:746-749). Giữ enum DB. | `AssetsPage.jsx`, `StatusBadge` mapping | **Needs confirmation** |
| Asset status UI rút gọn: `available` (Sẵn sàng), `assigned` (Đã bàn giao), `maintenance` (Đang bảo trì), `retired` (Đã thu hủy) | `AssetsPage.jsx`, `resources/js/components/ui/StatusBadge*` | **Needs confirmation** |

**Backend impact:** None.
**Frontend impact:** UI state slimming.
**Test plan:** Verify no test asserts `inventorying` shown in filter.
**Docs update:** `docs/feat_role.md`, `docs/DB_CONVENTIONS.md`.

---

## 12. Maintenance / Repair

### Vấn đề (chưa audit page chi tiết — đề xuất audit ở phase implement)

- need2fix muốn tách `Bảo trì` và `Sửa chữa` thành 2 tab/submenu.
- Type chỉ gồm: `Bảo trì`, `Sửa chữa`.
- Hiện `docs/feat_role.md:34` ghi maintenance type gồm: inspection, preventive, software_update, hardware_upgrade, calibration, repair, cleaning, replacement, other.
- DB có `maintenance_events`, `maintenance_details`, `repair_logs` (docs/DB_CONVENTIONS.md:28-30).

### Đề xuất

| Hành động | File | Safety |
|---|---|---|
| **KHÔNG** drop enum type cũ trong DB | migrations | **DO NOT TOUCH** |
| Mapping UI 2 nhóm: `Bảo trì` = {inspection, preventive, software_update, hardware_upgrade, calibration, cleaning, other}, `Sửa chữa` = {repair, replacement}. Implement như tab filter trên `MaintenancePage` | `MaintenancePage.jsx`, `MaintenanceEventController` summary | **Needs confirmation** từ stakeholder |
| Lập kế hoạch bảo trì định kỳ 6–12 tháng: cần audit nếu `maintenance_events` có column `next_scheduled_at` hoặc cần thêm | migrations | **Needs confirmation** |
| Nhật ký sửa chữa: dùng `repair_logs` đã có | `repair_logs` model + API | **Audit cần** |

**Backend impact:** Có thể thêm UI mapping helper, có thể thêm column scheduled.
**Frontend impact:** Tab/filter UI.
**Test plan:** Test maintenance grouping, periodic plan creation.
**Docs update:** `docs/feat_role.md:33-38`, `docs/RBAC_MATRIX.md:13`.

---

## 13. Inventory / Disposal / Reports

### Hiện trạng (chưa audit page chi tiết)

- need2fix muốn dashboard inventory card chỉ: Tổng thiết bị, Tổng giá trị còn lại, Lập kế hoạch kiểm kê.
- need2fix muốn bỏ ngưỡng `>=90%`; dùng `>75%` chỉ tạo đề xuất.
- need2fix muốn hiển thị `% khấu hao`, người kiểm, lần cuối, tình trạng thực tế, note đối chiếu.
- Reports: cần tạo + xuất; tối thiểu báo cáo tình trạng + khấu hao + đề xuất thu hủy + vòng đời rule-based.
- Dashboard: yêu cầu chờ duyệt + đề xuất thu hủy.

### Đề xuất

| Hành động | File | Safety |
|---|---|---|
| Audit `InventoryPage.jsx`, `DisposalPage.jsx`, `ReportPage.jsx`, `Dashboard.jsx` chi tiết | resources/js/pages | **Audit cần** |
| Bỏ mọi card ngưỡng `>=90%`; chỉ giữ `>75%` warning (đã đúng nghiệp vụ chốt trong `docs/feat_role.md:55-56`) | `InventoryPage.jsx`, `DisposalPage.jsx`, `Dashboard.jsx` | **Safe (sau audit)** |
| Thêm column `% khấu hao` trong bảng inventory + asset workspace | `InventoryPage.jsx`, `AssetsPage.jsx` | **Safe** |
| Thêm action "Lập kế hoạch kiểm kê" (POST `/api/inventory/checks`) đã có route (routes/api.php:195) — chỉ cần UI button | `InventoryPage.jsx` | **Safe** |
| Thêm export endpoint `/api/inventory/export` (route đã có line 193) + UI button "Xuất báo cáo" | `InventoryPage.jsx`, `ReportPage.jsx` | **Safe** |
| Dashboard thêm widget "Yêu cầu chờ duyệt" + "Đề xuất thu hủy" (đã có data từ `/api/review-requests` + `/api/disposal/assets`) | `Dashboard.jsx` | **Safe** |

**Backend impact:** Có thể bổ sung export Excel/PDF nếu chưa có.
**Frontend impact:** UI cards/columns/buttons.
**Test plan:** `php artisan test`, smoke test report export.
**Docs update:** `docs/feat_role.md:45-51, 53-60`.

---

## 14. RBAC Summary

| Module | manager | technician | employee | supplier | need2fix verdict |
|---|---|---|---|---|---|
| Dashboard | Full | Vận hành | Asset phụ trách | PO của mình | ✅ |
| Asset Catalog | CRUD | CRUD | Asset của mình (read) | ❌ | ✅ |
| Locations | CRUD | CRUD | ❌ | ❌ | ✅ |
| Maintenance | CRUD | CRUD | Liên quan (read) | ❌ | ✅ |
| Inventory | CRUD | CRUD | ❌ | ❌ | ✅ |
| Purchase Orders | CRUD | CRUD (hiện tại) | ❌ | Own | **Mâu thuẫn need2fix** (yêu cầu ẩn khỏi technician) — chờ confirm |
| Requests | CRUD/xem | CRUD/xem | Của mình | ❌ | ✅ |
| Review Requests | Duyệt | ❌ | ❌ | ❌ | ✅ |
| Disposal | Xử lý | Xử lý | ❌ | ❌ | ✅ |
| Reports | Xem/export | ❌ | ❌ | ❌ | ✅ |

---

## 15. Seed / Demo Text

### Vấn đề (need2fix)

- Đổi `Nguyễn Văn A` → `Nguyễn Văn An`.
- Chỉnh ngày demo phiếu: `06/05/2026` → `13/05/2026`.

### Đề xuất

| Hành động | File | Safety |
|---|---|---|
| Audit `database/seeders/DatabaseSeeder.php` + `database/seeders/*Seeder.php` + factories grep cho "Nguyễn Văn A" và "06/05/2026" | `database/seeders/`, `database/factories/` | **Audit cần** |
| Đổi text/date sau audit | seeders | **Safe** |

**Backend impact:** Reseed sạch.
**Frontend impact:** None.
**Test plan:** `php artisan migrate:fresh --seed` không lỗi; smoke test demo data đúng.
**Docs update:** `docs/SEED_DATA.md` nếu wording đổi.

---

## 16. ERD Document (`erd_final.md`)

### Vấn đề

`erd_final.md` hiện là SQL Server style nguyên bản từ file luận văn (untracked). Nội dung lệch với migration thực tế:

- `Locations` (erd_final.md:24-28) chỉ có `LocationID`, `LocationName` → thiếu `Description`, không có cột mã text.
- `PurchaseOrders` (erd_final.md:54-62) có status `Đang chuẩn bị, Chờ giao hàng, Giao hàng thành công` (3 status).
- `OrderDetails` (erd_final.md:64-73) có `UnitPrice`, `SubTotal` bắt buộc.
- `Returns` (erd_final.md:92-101) có `Reason` không phải `Condition`.
- `Maintenance` (erd_final.md:103-111) không có `Type` field.

### Đề xuất

| Hành động | File | Safety |
|---|---|---|
| **KHÔNG** sửa migration theo erd_final.md | migrations | **DO NOT TOUCH** |
| Cập nhật `erd_final.md` để phản ánh đúng schema hiện tại (Description trong Locations, status 2 trong POs nếu confirm, UnitPrice nullable trong OrderDetails, ReturnCondition trong Returns, Type trong Maintenance) | `erd_final.md` (file untracked, chỉ là tài liệu) | **Safe** — chỉ doc |
| Track `erd_final.md` trong git nếu muốn giữ làm tài liệu chính thức | git add | **Needs confirmation** |

**Backend impact:** None.
**Frontend impact:** None.
**Test plan:** None (chỉ doc).
**Docs update:** `erd_final.md` + có thể reference từ `docs/DB_CONVENTIONS.md`.

---

## 17. Phasing Plan (đề xuất thứ tự implement)

Sau khi audit được duyệt, implement theo 5 phase. Mỗi phase chạy đủ:

```powershell
npm run check:i18n
npm run build
php artisan test
```

### Phase 1 — Sidebar + i18n + naming (low risk, low scope)

- Sidebar reorder (qrScan + reviewRequests top-level)
- Section label rename (bỏ "BFD" wording)
- Search helper text bỏ "người phụ trách"
- Seed: "Nguyễn Văn A" → "Nguyễn Văn An", date 06/05 → 13/05

### Phase 2 — Catalog (Suppliers + Locations + Asset filters)

- Suppliers: thêm `note` column hoặc detail modal
- Locations: bỏ `areaFilter` hardcoded
- Asset categories: thu gọn về 5 option (cần Nguyên confirm)
- Asset filter UI: ẩn `inventorying` summary card nếu confirm

### Phase 3 — Purchase Orders

- Status enum UI rút gọn (cần Nguyên confirm 2-vs-3)
- List action chỉ `Chi tiết`, edit/delete vào detail modal
- Notification `PurchaseOrderCreated` (log mailer fallback)
- Toast "đã gửi thông báo NCC"

### Phase 4 — Requests / Review / Handover

- Audit chi tiết RequestsPage, ReviewRequestsPage, HandoverPage
- List → Chi tiết only
- Return modal có required `return_condition` (cần audit migration cột)
- Aggregate Review Request hiển thị nguồn (handover/return/maintenance/disposal) — read-only join, **KHÔNG** thêm enum
- "Thiết bị của tôi" = filtered view của AssetWorkspace

### Phase 5 — Maintenance / Inventory / Report / Dashboard

- Maintenance: tab Bảo trì / Sửa chữa
- Repair log UI
- Inventory: bỏ 90% threshold, thêm cột % khấu hao + người kiểm + lần cuối
- Report: button "Tạo báo cáo" + "Xuất"
- Dashboard: widget yêu cầu chờ duyệt + đề xuất thu hủy

---

## 18. Cần Nguyên Confirm Trước Khi Code

Các điểm chặn phase implement:

1. **Asset category enum** rút gọn về 5 hay giữ chi tiết 13?
2. **Purchase Order status** 2 status (gom preparing+shipping → "Chờ giao hàng") hay 3?
3. **Technician xem Purchase Order**: ẩn hay giữ?
4. **`inventorying` asset status**: ẩn khỏi UI hay giữ?
5. **Return condition column**: thêm column mới vào `returns` table (migration mới, không drop cũ) hay tận dụng `reason`/`notes`?
6. **Review Request type display**: aggregate join từ 4 workflow (handover, return, maintenance, disposal) hay chỉ giữ JUSTIFICATION + CONSUMABLE_REQUEST như hiện tại?
7. **Maintenance grouping**: ghép enum cũ về Bảo trì/Sửa chữa theo bảng mapping nào?

---

## 19. Files Audit Pending (đề xuất ở phase implement, không trong audit này)

Để giữ audit này tập trung và tránh sai sót, các file sau cần audit khi vào phase implement:

- `app/Http/Controllers/LocationController.php` + `app/Http/Requests/StoreLocationRequest.php`
- `app/Http/Controllers/RequestController.php` + `ReviewRequestController.php`
- `app/Http/Controllers/HandoverController.php`
- `app/Http/Controllers/MaintenanceEventController.php`
- `app/Http/Controllers/InventoryController.php`
- `app/Http/Controllers/ReportController.php`
- `app/Models/AssetRequest.php` / `Request.php`
- `app/Models/PurchaseOrder.php`
- `app/Models/Return.php` (verify columns `reason`, `condition`)
- `database/seeders/DatabaseSeeder.php`
- `resources/js/pages/RequestsPage.jsx`
- `resources/js/pages/ReviewRequestsPage.jsx`
- `resources/js/pages/HandoverPage.jsx`
- `resources/js/pages/MaintenancePage.jsx`
- `resources/js/pages/InventoryPage.jsx`
- `resources/js/pages/DisposalPage.jsx`
- `resources/js/pages/ReportPage.jsx`
- `resources/js/pages/Dashboard.jsx`
- `resources/js/i18n/locales/en.js` + `vi.js`
- `tests/Feature/*` để biết test gì đang khoá enum/status

---

## 20. Kết Luận

- Audit này xác nhận **`need2fix.pdf` về cơ bản là sửa UI + business flow alignment**, không phá schema.
- Có **7 điểm cần Nguyên/stakeholder confirm trước khi code** (mục 18).
- 5 phase implement không gây side-effect lớn nếu tuân scope guard mục 0.
- Hard guards giữ nguyên: `410 Gone` legacy, không drop migration, không personal loan, không thêm request enum mới, depreciation `> 75%` chỉ tạo đề xuất.
- TDD áp dụng cho phase implement: với mỗi behavior change, viết feature test trước (acceptance test), sau đó sửa code đến khi pass.

**Đề xuất bước kế tiếp:**

1. User/Nguyên review audit này.
2. Confirm 7 quyết định ở mục 18.
3. AI agent vào Phase 1 (Sidebar + i18n + seed naming) — phase ít rủi ro nhất.
4. Sau mỗi phase chạy `npm run check:i18n` + `npm run build` + `php artisan test`.
5. Commit từng phase với message rõ ràng, push lên branch `main` (hoặc feature branch nếu muốn cẩn thận hơn).
