# Checklist nghiệm thu theo vai trò và phân hệ

Tài liệu này dùng để kiểm tra nhanh xem hệ thống đã bám đúng phạm vi DFD mức 0 hay chưa sau khi refactor.

## 1. Phạm vi chính

Chỉ tập trung 5 nhiệm vụ:

1. Quản lý danh mục và hồ sơ
2. Quản lý cấp phát
3. Quản lý bảo trì sửa chữa
4. Quản lý thu hủy
5. Báo cáo và thống kê

Luồng sự cố bắt buộc phải đúng:

`nhân viên / bác sĩ báo cáo sự cố -> quản lý -> kỹ thuật viên`

## 2. Checklist theo vai trò

### 2.1 Manager

- Đăng nhập được.
- Thấy menu báo cáo.
- Thấy queue duyệt request.
- Duyệt được request `ASSET_LOAN`.
- Duyệt được request `CONSUMABLE_REQUEST`.
- Duyệt request `JUSTIFICATION` và bắt buộc chọn kỹ thuật viên.
- Sau khi duyệt phiếu sự cố, sinh `maintenance_event`.
- Xem được báo cáo tổng hợp.
- Đổi role user được.

### 2.2 Technician

- Đăng nhập được.
- Thấy menu tài sản, tồn kho, vị trí, bảo trì, thu hủy.
- Không thấy hoặc không vào được báo cáo.
- Không vào được queue duyệt.
- Tạo được maintenance event.
- Bắt đầu/hoàn thành/hủy maintenance event được.
- Khóa và mở off-service được.
- Thu hủy asset được.
- Xem được request ở góc độ vận hành.

### 2.3 Doctor

- Đăng nhập được.
- Xem được tài sản cá nhân.
- Quét QR được.
- Check-in/check-out được với tài sản hợp lệ.
- Tạo được `JUSTIFICATION`.
- Tạo được `ASSET_LOAN`.
- Tạo được `CONSUMABLE_REQUEST`.
- Chỉ xem được request của mình.
- Không vào được danh mục tổng, bảo trì, thu hủy, báo cáo.

### 2.4 Employee

- Đăng nhập được.
- Hành vi tương tự `doctor` ở nhóm request và tài sản cá nhân.
- Không vào được nhóm quản trị.

## 3. Checklist theo phân hệ

### 3.1 Quản lý danh mục và hồ sơ

- Tạo tài sản được.
- Sửa tài sản được.
- Gán/thu hồi tài sản được.
- Tạo lại QR được.
- CRUD vị trí được.
- Xem tồn kho và định giá được.

### 3.2 Quản lý cấp phát

- User cuối tạo request được.
- Request được lưu ở trạng thái `SUBMITTED`.
- Manager duyệt hoặc từ chối được.
- Có `request_events`.
- Có `approvals`.
- Technician không duyệt được.

### 3.3 Quản lý bảo trì sửa chữa

- Phiếu sự cố sau khi duyệt sinh event `DISPATCHED`.
- Có `assigned_to_user_id` ở request.
- Có `maintenance_events` loại `repair`.
- Có `repair_logs` đồng bộ theo maintenance.
- Asset `off_service` hoặc `maintenance` bị chặn ở:
  - loan
  - assign
  - check-in

### 3.4 Quản lý thu hủy

- Retire asset đổi trạng thái sang `retired`.
- Có bản ghi ở `disposals`.
- Báo cáo đọc được dữ liệu thu hủy.

### 3.5 Báo cáo và thống kê

- Manager xem được summary.
- Technician, doctor, employee bị chặn.
- Báo cáo đọc được số liệu từ:
  - `assets`
  - `requests`
  - `maintenance_events`
  - `disposals`

## 4. Regression checklist kỹ thuật

- `php artisan test tests/Feature/RequestTest.php`
- `php artisan test tests/Feature/MaintenanceTest.php`
- `php artisan test tests/Feature/ReportTest.php`
- `php artisan test tests/Feature/ErdAlignmentTest.php`
- `npm run build`

## 5. Những điểm cần soi kỹ khi review

- Có còn route hoặc UI nào dùng logic `admin/hr/staff` cũ không.
- Có chỗ nào technician lỡ được quyền duyệt request không.
- Có chỗ nào manager không còn quyền vận hành danh mục hay bảo trì không.
- Có API nào vẫn mở quá rộng cho doctor/employee không.
- Có phiếu sự cố nào duyệt thành công mà không chỉ định kỹ thuật viên không.

## 6. Dấu hiệu đạt yêu cầu

Có thể xem là đạt phạm vi hiện tại khi:

- README và docs đều mô tả 5 phân hệ, không còn lấy `admin/hr` làm mô hình chính.
- Role trong DB được normalize về `manager/technician/doctor/employee`.
- Luồng sự cố chuyển từ request sang maintenance chạy được đầu cuối.
- Thu hủy có record riêng.
- Báo cáo phản ánh đúng 4 nhóm dữ liệu lõi.

## 7. Tài liệu liên quan

- [Tính năng theo vai trò](ROLE_FEATURES.md)
- [Ma trận RBAC](RBAC_MATRIX.md)
- [Dữ liệu mẫu](SEED_DATA.md)
