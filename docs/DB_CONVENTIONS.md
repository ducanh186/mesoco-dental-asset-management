# Database Conventions

`Database` là nơi lưu dữ liệu nghiệp vụ. Trong dự án này, migration Laravel là nguồn sự thật. `schema.sql` chỉ là bản export để đọc nhanh cấu trúc sau khi chạy migrate mới.

## Nguyên Tắc Chung

- Không rewrite migration lịch sử trong cleanup hiện tại.
- Không drop bảng/cột legacy nếu chưa có plan migration phá vỡ tương thích.
- Model và API active chỉ dùng scope IT Asset Management.
- Seed data mới chỉ tạo thiết bị IT và phòng ban công ty.
- Legacy endpoint trả `410 Gone` thay vì xóa route.

## Bảng Chính

| Bảng | Vai trò |
| --- | --- |
| `users` | Tài khoản đăng nhập, role canonical và liên kết employee/supplier |
| `roles`, `account_roles` | Chuẩn hóa role và lịch sử gán role |
| `employees` | Hồ sơ nhân viên nội bộ |
| `suppliers` | Nhà cung cấp thiết bị/vật tư |
| `assets` | Tài sản IT, trạng thái, chi phí, khấu hao, phòng ban |
| `categories` | Danh mục category cho asset |
| `asset_assignments` | Lịch sử bàn giao tài sản |
| `maintenance_events` | Phiếu bảo trì cấp sự kiện |
| `maintenance_details` | Chi tiết xử lý bảo trì |
| `repair_logs` | Nhật ký sửa chữa |
| `inventory_checks` | Đợt kiểm kê |
| `inventory_check_items` | Từng dòng thiết bị trong đợt kiểm kê |
| `purchase_orders` | Đơn mua hàng |
| `purchase_order_items` | Dòng thiết bị/vật tư trong đơn mua |
| `requests` | Phiếu báo sự cố hoặc xin vật tư IT |
| `request_items` | Dòng vật tư trong request |
| `request_events` | Lịch sử trạng thái request |
| `disposals`, `disposal_details` | Thanh lý hoặc loại bỏ tài sản |

## Asset Type Và Category

`assets.type` vẫn giữ enum generic để tránh migration rủi ro:

- `machine`
- `equipment`
- `tool`
- `tray`
- `other`

Ý nghĩa IT hiện được thể hiện qua `category`:

- `Laptop`
- `Desktop`
- `Monitor`
- `Network`
- `Server`
- `Peripheral`
- `Printer`
- `Mobile Device`
- `Office IT`
- `Other`

Trade-off: giữ `type` generic giúp ít rủi ro dữ liệu hơn, nhưng khi làm báo cáo cần đọc `category` để biết thiết bị là laptop hay printer.

## Maintenance Types

Các type active:

- `inspection`
- `preventive`
- `software_update`
- `hardware_upgrade`
- `calibration`
- `repair`
- `cleaning`
- `replacement`
- `other`

Dữ liệu cũ nếu còn sẽ được map ở tầng validation/normalization khi cần đọc lại.

## Request Types

Request active chỉ gồm:

- `JUSTIFICATION`: báo sự cố thiết bị IT.
- `CONSUMABLE_REQUEST`: xin vật tư hoặc linh kiện IT.

Request mượn/trả thiết bị không còn thuộc scope active và bị reject bằng validation.

## Legacy Tables

Một số bảng hoặc cột legacy có thể còn trong migration/schema vì lý do compatibility. Chúng không nên được dùng để xây UI mới. Nếu cần xóa thật sự, hãy lập migration riêng với backup, data mapping và regression test.

## Regenerate Schema

Quy trình regenerate `schema.sql`:

1. Tạo SQLite database tạm.
2. Chạy `php artisan migrate:fresh --force` với `DB_DATABASE` trỏ vào file tạm.
3. Export schema từ SQLite.
4. Xóa database tạm.

Không dùng database local có dữ liệu thật để export schema.
