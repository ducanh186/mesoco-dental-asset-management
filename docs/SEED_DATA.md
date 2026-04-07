# Dữ liệu mẫu và seeder

Tài liệu này mô tả các seeder đang có trong repo, cách chạy và các tài khoản demo ổn định để kiểm thử nghiệp vụ.

## 1. Mục tiêu

Seeder trong dự án phục vụ 3 mục đích:

- dựng nhanh môi trường local
- tạo dữ liệu demo cho 5 phân hệ chính
- đồng bộ dữ liệu cũ sang schema đã align theo ERD mới

## 2. Các seeder chính

### 2.1 `DatabaseSeeder`

Phục vụ dữ liệu tối thiểu để chạy app nhanh.

Bao gồm:

- shift cơ bản
- một số employee và user nền
- một số asset, QR, assignment, check-in

Phù hợp khi cần:

- smoke test nhanh
- kiểm tra luồng đăng nhập
- phát triển tính năng nhỏ

### 2.2 `FinalMvpSeeder`

Seeder demo lớn cho hầu hết phân hệ.

Bao gồm:

- location
- shift
- employee và user cho nhiều vai trò
- asset số lượng lớn
- assignment
- request nhiều trạng thái
- check-in
- maintenance event
- feedback cũ để tương thích

Seeder này gọi thêm `ErdAlignmentSeeder` sau khi tạo dữ liệu.

### 2.3 `DemoSeeder`

Seeder bổ sung để tạo thêm case demo tương thích, đặc biệt ở các phần:

- request mẫu
- maintenance event mẫu
- feedback mẫu
- contract mẫu

Seeder này cũng gọi thêm `ErdAlignmentSeeder`.

### 2.4 `ErdAlignmentSeeder`

Seeder đồng bộ dữ liệu cũ sang schema mới:

- chuẩn hóa `users.role` và `role_id`
- tạo `categories`
- backfill `approvals`
- đồng bộ `assigned_to_user_id` ở maintenance
- tạo `repair_logs`
- tạo `disposals` cho tài sản đã retired

## 3. Cách chạy

### Dựng dữ liệu tối thiểu

```bash
php artisan db:seed
```

### Dựng dataset demo lớn

```bash
php artisan db:seed --class=FinalMvpSeeder
```

### Bơm thêm case demo tương thích

```bash
php artisan db:seed --class=DemoSeeder
```

### Chạy đồng bộ schema ERD riêng

```bash
php artisan db:seed --class=ErdAlignmentSeeder
```

### Reset toàn bộ rồi seed lại

```bash
php artisan migrate:fresh --seed
```

## 4. Bộ tài khoản demo ổn định

Các tài khoản dưới đây ổn định trong dữ liệu local tối thiểu và cũng được `DemoSeeder` giữ đồng nhất:

| Mã nhân viên | Vai trò | Email | Mật khẩu |
| --- | --- | --- | --- |
| `E0001` | `manager` | `manager@mesoco.vn` | `password` |
| `E0002` | `technician` | `technician@mesoco.vn` | `password` |
| `E0003` | `doctor` | `doctor@mesoco.vn` | `password` |
| `E0004` | `technician` | `tech@mesoco.vn` | `password` |
| `E0005` | `employee` | `staff@mesoco.vn` | `password` |

Dataset mở rộng từ `FinalMvpSeeder` có thể có thêm:

- `E0006`
- `E0007`
- `E0008`
- các employee không có tài khoản đăng nhập như `E0009`, `E0010`

## 5. Những nhóm dữ liệu đã được seed

### 5.1 Danh mục và hồ sơ

- vị trí
- tài sản
- category
- QR identity
- assignment
- employee
- user
- role

### 5.2 Cấp phát

- request đủ loại:
  - `JUSTIFICATION`
  - `ASSET_LOAN`
  - `CONSUMABLE_REQUEST`
- request ở nhiều trạng thái:
  - `SUBMITTED`
  - `APPROVED`
  - `REJECTED`
  - `CANCELLED`
- request event
- approval record

### 5.3 Bảo trì và sửa chữa

- maintenance event:
  - `scheduled`
  - `in_progress`
  - `completed`
  - `canceled`
- repair log được sync cho event loại `repair`

### 5.4 Thu hủy

- asset `retired`
- disposal record do seeder đồng bộ tạo ra hoặc do dữ liệu demo sinh sẵn

### 5.5 Báo cáo

Seeder không tạo bảng “report” riêng. Báo cáo được tính tổng hợp từ:

- `assets`
- `requests`
- `maintenance_events`
- `disposals`

## 6. Kịch bản kiểm thử đề xuất

### 6.1 Luồng báo sự cố

1. Đăng nhập `E0003`
2. Tạo request loại `JUSTIFICATION`
3. Đăng nhập `E0001`
4. Duyệt request và chỉ định `E0002` hoặc `E0004`
5. Kiểm tra có `maintenance_events` và `repair_logs`

### 6.2 Luồng mượn thiết bị

1. Đăng nhập `E0005`
2. Tạo request loại `ASSET_LOAN`
3. Đăng nhập `E0001`
4. Duyệt hoặc từ chối
5. Kiểm tra `request_events` và `approvals`

### 6.3 Luồng bảo trì

1. Đăng nhập `E0002` hoặc `E0004`
2. Vào danh sách bảo trì
3. Bắt đầu event `scheduled`
4. Hoàn thành event
5. Kiểm tra lock/unlock của tài sản

### 6.4 Luồng thu hủy

1. Đăng nhập `E0002` hoặc `E0001`
2. Thực hiện retire một asset
3. Kiểm tra:
   - `assets.status = retired`
   - có record ở `disposals`

## 7. Tính chất idempotent

Seeder trong repo chủ yếu dùng:

- `updateOrCreate`
- `firstOrCreate`

Nghĩa là:

- có thể chạy lại nhiều lần
- hạn chế tạo trùng
- phù hợp cho local/dev/demo

Tuy nhiên vẫn nên cẩn thận khi:

- đã có dữ liệu thật trong DB
- dùng chung DB giữa nhiều người
- cần giữ nguyên timestamp lịch sử

## 8. Gợi ý dùng seeder theo ngữ cảnh

| Nhu cầu | Lệnh phù hợp |
| --- | --- |
| Dựng local nhanh | `php artisan db:seed` |
| Demo đầy đủ | `php artisan db:seed --class=FinalMvpSeeder` |
| Tạo thêm case minh họa | `php artisan db:seed --class=DemoSeeder` |
| Đồng bộ sau khi đổi schema | `php artisan db:seed --class=ErdAlignmentSeeder` |
| Reset hoàn toàn | `php artisan migrate:fresh --seed` |

## 9. Tài liệu liên quan

- [Stack công nghệ](STACK.md)
- [Quy ước database](DB_CONVENTIONS.md)
- [Checklist nghiệm thu](feat_role.md)
