# Database Conventions

`Database` là nơi lưu dữ liệu nghiệp vụ. Trong dự án này, migration Laravel là nguồn sự thật. `schema.sql` chỉ là bản export để đọc nhanh cấu trúc sau khi chạy migrate mới.

## Nguyên Tắc Chung

- Không rewrite migration lịch sử trong cleanup hiện tại.
- Không drop bảng/cột legacy nếu chưa có plan migration phá vỡ tương thích.
- Model và API active dùng scope: `Asset -> Location`, `Asset -> Responsible Employee`, `Asset -> Depreciation -> Disposal Proposal`.
- Seed data active tạo tài sản IT, vị trí, nhân viên chịu trách nhiệm, maintenance, inventory và purchase order.
- Legacy endpoint trả lỗi rõ ràng thay vì rơi vào HTML của SPA.

## Bảng Chính

| Bảng | Vai trò |
| --- | --- |
| `users` | Tài khoản đăng nhập, role canonical và liên kết employee/supplier |
| `employees` | Hồ sơ nhân viên nội bộ; dùng `position` để thể hiện chức vụ |
| `suppliers` | Nhà cung cấp thiết bị/vật tư |
| `locations` | Mã vị trí, tên vị trí, mô tả nơi đặt tài sản |
| `assets` | Tài sản IT, trạng thái, vị trí, serial/model/QR, chi phí, khấu hao, bảo hành |
| `asset_qr_identities` | Lịch sử phát hành QR identity cho asset portal |
| `categories` | Danh mục category cho asset |
| `assignments` | Header bàn giao tài sản theo user/staff |
| `assignment_details` | Asset lines nằm trong từng lần bàn giao |
| `returns` | Giao dịch thu hồi cho một lần bàn giao |
| `asset_assignments` | Mirror compatibility cho flow cũ theo employee |
| `maintenance_events` | Phiếu bảo trì cấp sự kiện |
| `maintenance_details` | Chi tiết xử lý bảo trì |
| `repair_logs` | Nhật ký sửa chữa |
| `inventory_checks` | Đợt kiểm kê |
| `inventory_check_items` | Từng dòng thiết bị trong đợt kiểm kê |
| `purchase_orders` | Đơn mua hàng |
| `purchase_order_items` | Dòng thiết bị/vật tư trong đơn mua |
| `requests` | Phiếu báo sự cố hoặc xin vật tư IT |
| `request_items` | Dòng asset/vật tư trong request |
| `request_events` | Lịch sử trạng thái request |
| `disposals`, `disposal_details` | Thanh lý hoặc loại bỏ tài sản |

## Location

Nguồn chính của vị trí là bảng `locations`:

- `code`: mã vị trí, unique, ví dụ `LOC-001`.
- `name`: tên vị trí, ví dụ `Kho IT`.
- `description`: mô tả ngắn.

`assets.location_id` trỏ tới `locations.id`. Các cột `assets.location` và `locations.address` được giữ để tương thích dữ liệu cũ, không dùng làm nguồn chính trong UI active.

## Asset Master Fields

Asset active đang được align dần sang ERD mới nhưng vẫn giữ compatibility field cũ:

- `assets.serial_number`: serial của thiết bị; dữ liệu cũ được backfill từ `asset_code`.
- `assets.model`: model thương mại/kỹ thuật của thiết bị.
- `assets.configuration`: cấu hình chi tiết để hiển thị trên workspace và portal.
- `assets.qr_code`: alias mới của payload QR; vẫn sync với `assets.qr_value` cũ.
- `assets.purchase_price`: alias mới, sync với `assets.purchase_cost`.
- `assets.current_depreciation_rate`: alias mới, sync với `assets.depreciation_rate`.

API active hiện trả song song cả field compatibility và field ERD mới để frontend cũ và frontend mới cùng đọc được.

## Responsible Employee

Nguồn active đang chuyển sang workflow mới:

- `assignments.staff_id`: user nhận tài sản.
- `assignment_details.asset_id`: asset thuộc lần bàn giao nào.
- `returns.assignment_id`: đánh dấu lần bàn giao đã được thu hồi.

Trong giai đoạn chuyển tiếp:

- API `POST /api/assets/{asset}/assign` ưu tiên `staff_id`, nhưng vẫn nhận `employee_id` để tương thích UI cũ.
- Nếu chỉ có `employee_id`, backend sẽ resolve hoặc auto-provision `users.employee_id` tương ứng để tạo `staff_id` theo ERD mới.
- `asset_assignments` vẫn được ghi song song làm compatibility mirror cho các call-site cũ.
- Các row `department_name` cũ chỉ còn là dữ liệu lịch sử/compatibility.
- Khi thu hồi hoặc thu hủy asset, active assignment được đóng ở cả `returns` và `asset_assignments.unassigned_at`.

## Depreciation Và Disposal

Tài sản được đưa vào danh sách đề xuất thu hủy khi depreciation percentage `> 75%`. Mốc này chỉ tạo đề xuất nghiệp vụ, không tự chuyển status.

Khi retire/dispose asset:

- `assets.status = retired`
- `assets.location_id = null`
- `assets.location = null`
- active responsible assignment được đóng lại

## QR Asset Portal

QR asset portal dùng hai lớp dữ liệu:

- `asset_qr_identities.qr_uid`: identity bền vững cho từng lần regenerate QR.
- `assets.qr_code` / `assets.qr_value`: payload QR gần nhất để workspace đọc nhanh.

Contract active cho dual-flow QR:

- QR in ra trên nhãn nên encode `GET /asset-portal/{qrUid}` để camera điện thoại mở portal trực tiếp.
- `POST /api/qr/resolve` chấp nhận cả portal URL `/asset-portal/{qrUid}` và payload legacy `MESOCO|ASSET|v1|<uuid>`.
- Payload legacy vẫn được lưu trong `assets.qr_code` / `assets.qr_value` để compatibility với scanner nội bộ và nhãn cũ.

API/route active:

- `POST /api/qr/resolve`: resolve portal URL hoặc payload `MESOCO|ASSET|v1|<uuid>` sang asset hiện tại.
- `POST /api/assets/{asset}/regenerate-qr`: tạo QR identity mới nhưng vẫn giữ lịch sử QR cũ.
- `GET /asset-portal/{qrUid}`: read-only portal view cho tài sản được resolve từ QR; nếu chưa đăng nhập thì redirect tới `/login?redirect=/asset-portal/{qrUid}`.

QR portal response dùng cùng một QR payload nhưng cắt dữ liệu theo role:

- `employee`: nhóm basic gồm asset name, model/configuration, status, warranty status, current responsible user, category/location.
- `technician`: basic + technical gồm repair logs, last maintenance date, last issue/action, depreciation rate, remaining value, device status.
- `manager`: basic + technical + supplier/purchase gồm purchase price, purchase date và supplier contact.

Phần này tương ứng với view báo cáo `View_AssetPortal_Full`; trong app Laravel, dữ liệu được compose ở controller để vẫn áp dụng RBAC theo user đang đăng nhập. Public user không xem portal trực tiếp vì hệ thống cần biết role trước khi hiển thị dữ liệu.

## Request Types

Request active chỉ gồm:

- `JUSTIFICATION`: báo sự cố thiết bị IT.
- `CONSUMABLE_REQUEST`: xin vật tư hoặc linh kiện IT.

## Regenerate Schema

```bash
php artisan migrate:fresh --force
php artisan schema:dump
```

Không dùng database local có dữ liệu thật để export schema.
