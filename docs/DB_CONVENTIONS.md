# Quy ước database

Tài liệu này mô tả quy ước đặt tên, các bảng lõi và các mối quan hệ quan trọng đang được dùng trong hệ thống sau khi align theo ERD mới.

## 1. Mục tiêu thiết kế

Schema hiện tại phục vụ 5 nghiệp vụ chính:

1. Quản lý danh mục và hồ sơ
2. Quản lý cấp phát
3. Quản lý bảo trì sửa chữa
4. Quản lý thu hủy
5. Báo cáo và thống kê

Thiết kế ưu tiên:

- giữ tương thích với dữ liệu cũ
- chuẩn hóa role
- audit được luồng phê duyệt
- có thể truy ngược từ sự cố sang bảo trì và thu hủy

## 2. Quy ước đặt tên

### 2.1 Bảng

- Dùng `snake_case`
- Dùng dạng số nhiều
- Ví dụ:
  - `assets`
  - `asset_assignments`
  - `maintenance_events`
  - `purchase_order_items`

### 2.2 Cột

- Khóa chính luôn là `id`
- Khóa ngoại có dạng `{singular_table}_id`
- Datetime dùng hậu tố `_at`
- Date dùng hậu tố `_date`
- Cờ boolean dùng tiền tố `is_`

Ví dụ:

- `reviewed_by_user_id`
- `assigned_to_user_id`
- `disposed_at`
- `is_active`

## 3. Nhóm bảng lõi

### 3.1 Nhân sự và tài khoản

| Bảng | Vai trò |
| --- | --- |
| `employees` | Hồ sơ nhân sự thực tế |
| `users` | Tài khoản đăng nhập |
| `roles` | Danh mục role chuẩn hóa |

Quy ước:

- `users.employee_id` trỏ về hồ sơ nhân sự.
- `users.role` vẫn được giữ để tương thích.
- `users.role_id` là khóa ngoại chuẩn hóa sang `roles`.

Role chuẩn hiện hành:

- `manager`
- `technician`
- `doctor`
- `employee`

Alias cũ được normalize:

- `admin -> manager`
- `hr -> technician`
- `staff -> employee`

### 3.2 Danh mục và tài sản

| Bảng | Vai trò |
| --- | --- |
| `assets` | Hồ sơ tài sản |
| `categories` | Danh mục tài sản |
| `locations` | Vị trí sử dụng/lưu kho |
| `suppliers` | Nhà cung cấp |
| `asset_qr_identities` | Danh tính QR |
| `asset_assignments` | Lịch sử giao nhận tài sản |
| `asset_checkins` | Nhật ký check-in/check-out |

Trạng thái tài sản quan trọng:

- `active`
- `off_service`
- `maintenance`
- `retired`

### 3.3 Request, phê duyệt và điều phối

| Bảng | Vai trò |
| --- | --- |
| `requests` | Header của phiếu |
| `request_items` | Chi tiết item/request |
| `request_events` | Nhật ký trạng thái |
| `approvals` | Lớp phê duyệt chuẩn hóa |

Loại request:

- `JUSTIFICATION`
- `ASSET_LOAN`
- `CONSUMABLE_REQUEST`

Trạng thái request:

- `SUBMITTED`
- `APPROVED`
- `REJECTED`
- `CANCELLED`

Event quan trọng:

- `CREATED`
- `SUBMITTED`
- `APPROVED`
- `DISPATCHED`
- `REJECTED`
- `CANCELLED`

`DISPATCHED` là event dùng cho luồng:

`phiếu sự cố đã duyệt -> giao cho kỹ thuật viên -> sinh ticket bảo trì`

### 3.4 Bảo trì và sửa chữa

| Bảng | Vai trò |
| --- | --- |
| `maintenance_events` | Ticket bảo trì/sửa chữa |
| `repair_logs` | Nhật ký sửa chữa chuẩn hóa |

Trạng thái `maintenance_events`:

- `scheduled`
- `in_progress`
- `completed`
- `canceled`

Quy ước đặc biệt:

- `assigned_to_user_id` là khóa ngoại chuẩn.
- `assigned_to` được giữ để tương thích dữ liệu cũ và hiển thị nhanh.
- Khi event loại `repair` được tạo/cập nhật, hệ thống sync sang `repair_logs`.

### 3.5 Thu hủy và mua sắm

| Bảng | Vai trò |
| --- | --- |
| `disposals` | Nhật ký thu hủy/thanh lý |
| `purchase_orders` | Đơn mua |
| `purchase_order_items` | Dòng hàng của đơn mua |

`disposals` phục vụ các case:

- hủy
- thanh lý
- bán phế liệu
- ghi nhận giá trị thu hồi

## 4. Quan hệ quan trọng

### 4.1 Employee và User

```text
employees 1 --- 0..1 users
```

- `employees` là hồ sơ người thật
- `users` là tài khoản hệ thống

### 4.2 Asset và Assignment

```text
assets 1 --- * asset_assignments * --- 1 employees
```

- Mỗi tài sản có nhiều lần giao nhận theo thời gian.
- Chỉ assignment chưa `unassigned_at` mới được coi là đang hiệu lực.

### 4.3 Request sự cố và bảo trì

```text
requests
  -> approvals
  -> request_events
  -> assigned_to_user_id (technician)
  -> maintenance_events (phát sinh sau khi manager duyệt)
  -> repair_logs (đồng bộ từ maintenance_events loại repair)
```

Đây là luồng chính cho yêu cầu:

`nhân viên / bác sĩ báo sự cố -> quản lý duyệt -> kỹ thuật viên xử lý`

### 4.4 Asset và Disposal

```text
assets 1 --- * disposals
```

- Một tài sản có thể có nhiều bản ghi thu hủy nếu cần lưu lịch sử điều chỉnh.
- Ở luồng chuẩn hiện tại, tài sản retired sẽ có ít nhất một disposal record.

## 5. Trường dữ liệu giữ tương thích

Schema hiện có một số cặp cột song song để không phá dữ liệu cũ:

| Cột | Mục đích |
| --- | --- |
| `users.role` và `users.role_id` | Tương thích role cũ và chuẩn hóa sang bảng `roles` |
| `maintenance_events.assigned_to` và `assigned_to_user_id` | Hỗ trợ dữ liệu text cũ và liên kết user chuẩn |
| `requests.asset_id` và `request_items.asset_id` | Header giữ asset chính, item giữ chi tiết |

Nguyên tắc:

- Dùng khóa ngoại chuẩn khi có thể.
- Giữ trường text cũ để đọc dữ liệu legacy.
- Seeder/migration sẽ backfill từ trường cũ sang trường mới.

## 6. Quy ước migration

Tên file migration theo mẫu:

```text
YYYY_MM_DD_HHMMSS_ten_nghiep_vu.php
```

Ví dụ:

- `2026_04_07_180000_create_erd_alignment_tables.php`
- `2026_04_07_180100_align_existing_tables_with_erd.php`
- `2026_04_07_190000_normalize_roles_for_dfd_scope.php`

## 7. Quy ước seeder

Seeder chính trong repo:

- `DatabaseSeeder`: dữ liệu tối thiểu cho môi trường local
- `FinalMvpSeeder`: dataset demo lớn
- `DemoSeeder`: dữ liệu tương thích và tình huống demo bổ sung
- `ErdAlignmentSeeder`: backfill role/category/approval/repair/disposal

Ưu tiên:

- dùng `updateOrCreate`, `firstOrCreate`
- tránh tạo dữ liệu trùng
- có thể chạy nhiều lần

## 8. Ràng buộc nghiệp vụ cần giữ

- Tài sản `off_service` hoặc `maintenance` không được:
  - check-in
  - assign
  - loan
- Phiếu `JUSTIFICATION` khi duyệt phải có `assigned_to_user_id`.
- User được chỉ định cho phiếu sự cố phải là `technician`.
- Event bảo trì loại `repair` phải đồng bộ sang `repair_logs`.
- Tài sản `retired` cần có `disposals`.

## 9. Khi thêm bảng mới

Khi mở rộng schema, nên tuân thủ:

- có model rõ ràng nếu bảng đi vào nghiệp vụ chính
- có seeder/backfill nếu ảnh hưởng dữ liệu cũ
- không phá các cột legacy đang được frontend hoặc seeder cũ dùng
- cập nhật tài liệu trong:
  - `DB_CONVENTIONS.md`
  - `SEED_DATA.md`
  - `RBAC_MATRIX.md` nếu có API mới

## 10. Tài liệu liên quan

- [Stack công nghệ](STACK.md)
- [Ma trận RBAC](RBAC_MATRIX.md)
- [Dữ liệu mẫu](SEED_DATA.md)
