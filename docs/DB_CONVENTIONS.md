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
| `assets` | Tài sản IT, trạng thái, vị trí, chi phí, khấu hao, bảo hành |
| `categories` | Danh mục category cho asset |
| `asset_assignments` | Lịch sử nhân viên chịu trách nhiệm |
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

## Responsible Employee

Nguồn chính của người chịu trách nhiệm là `asset_assignments.employee_id` với `unassigned_at = null`.

- Tài sản active có thể chưa có nhân viên chịu trách nhiệm.
- Khi assign thì bắt buộc chọn `employee_id`.
- Các row `department_name` cũ chỉ là dữ liệu lịch sử/compatibility.
- Khi thu hủy asset, active assignment được kết thúc bằng `unassigned_at = disposed_at`.

## Depreciation Và Disposal

Tài sản được đưa vào danh sách đề xuất thu hủy khi depreciation percentage `> 75%`. Mốc này chỉ tạo đề xuất nghiệp vụ, không tự chuyển status.

Khi retire/dispose asset:

- `assets.status = retired`
- `assets.location_id = null`
- `assets.location = null`
- active responsible assignment được đóng lại

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
