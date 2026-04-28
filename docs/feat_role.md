# Checklist Nghiệm Thu Theo Scope Mới

Scope mới: quản lý trang thiết bị IT theo vị trí và nhân viên chịu trách nhiệm. Hệ thống không thêm đơn vị tổ chức nội bộ vào nghiệp vụ active.

## Danh Mục Thiết Bị IT

- [x] Asset có category IT như Laptop, Desktop, Monitor, Network, Server, Peripheral, Printer.
- [x] Asset lưu ngày mua, giá mua, thời hạn sử dụng, giá trị thu hồi và bảo hành.
- [x] Asset có trạng thái active, maintenance, off service, retired.
- [x] API asset trả structured `location` và `responsible_employee`.

## Location

- [x] Location có `code`, `name`, `description`.
- [x] `locations.code` unique.
- [x] Asset có `location_id` nullable tới `locations.id`.
- [x] UI active dùng mã vị trí, tên vị trí và mô tả.

## Responsible Employee

- [x] `POST /api/assets/{id}/assign` nhận `{ employee_id: number }`.
- [x] Gửi `department_name` mà không có `employee_id` bị reject `422`.
- [x] Asset hiển thị nhân viên chịu trách nhiệm hiện tại.
- [x] Dashboard employee đọc dữ liệu từ `/api/my-assigned-assets/dropdown`.
- [x] `/api/department-assets/dropdown` vẫn là alias compatibility.

## Maintenance

- [x] Maintenance type chuyển sang IT-safe: inspection, preventive, software_update, hardware_upgrade, calibration, repair, cleaning, replacement, other.
- [x] Manager/technician tạo và cập nhật maintenance.
- [x] Maintenance có chi tiết xử lý, technician, chi phí và thời điểm hoàn tất.
- [x] Báo cáo và dashboard đọc được trạng thái maintenance.

## Requests

- [x] Employee tạo phiếu báo sự cố thiết bị mình phụ trách.
- [x] Employee tạo phiếu xin vật tư hoặc linh kiện IT.
- [x] Manager duyệt hoặc từ chối request.

## Inventory Và Valuation

- [x] Kiểm kê theo đợt.
- [x] Tính giá trị còn lại theo purchase cost, useful life và salvage value.
- [x] Theo dõi warranty expiring soon.
- [x] Location filter dùng canonical location code/name.

## Depreciation Và Disposal

- [x] Depreciation `75%` chưa được đề xuất thu hủy.
- [x] Depreciation `> 75%` được đưa vào danh sách đề xuất thu hủy.
- [x] Khi retire asset: `status = retired`.
- [x] Khi retire asset: `location_id = null` và legacy `location = null`.
- [x] Khi retire asset: active responsible assignment được đóng.

## Purchase Orders Và Supplier

- [x] Manager/technician tạo đơn mua hàng.
- [x] Supplier chỉ xem đơn thuộc supplier của mình.
- [x] Supplier cập nhật trạng thái preparing, shipping, delivered.

## Legacy Compatibility

- [x] Endpoint cũ về mã cá nhân trả `410 Gone`.
- [x] Endpoint cũ về personal asset/history trả `410 Gone`.
- [x] Endpoint cũ về available-for-loan trả `410 Gone`.
- [x] Endpoint cũ về employee contract trả `410 Gone`.
- [x] Không drop migration lịch sử trong cleanup này.

## Test Và Build

- [x] `php artisan test`
- [x] `npm run check:i18n`
- [x] `npm run build`
- [x] `git diff --check`
- [ ] Smoke test: tạo location -> tạo asset -> gắn responsible employee -> employee thấy asset -> retire asset -> location/responsible employee biến mất.
