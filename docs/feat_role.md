# Checklist Nghiệm Thu Theo Scope Mới

Scope mới: quản lý trang thiết bị Mesoco theo vị trí và nhân viên chịu trách nhiệm. Hệ thống không thêm đơn vị tổ chức nội bộ vào nghiệp vụ active.

## Danh Mục Thiết Bị

- [x] Asset có category như Laptop, Desktop, Monitor, Network, Server, Peripheral, Printer.
- [x] Asset lưu ngày mua, giá mua, thời hạn sử dụng, giá trị thu hồi và bảo hành.
- [x] Asset có trạng thái active, maintenance, off service, retired.
- [x] API asset trả structured `location` và `responsible_employee`.
- [x] Asset workspace hỗ trợ tìm theo mã thiết bị, danh mục, vị trí và người đang giữ.
- [x] Asset workspace có filter riêng cho vị trí, trạng thái và assignment.

## Location

- [x] Location có `code`, `name`, `description`.
- [x] `locations.code` unique.
- [x] Asset có `location_id` nullable tới `locations.id`.
- [x] UI active dùng mã vị trí, tên vị trí và mô tả.

## Responsible Employee

- [x] `POST /api/assets/{id}/assign` nhận `{ employee_id: number }`.
- [x] Gửi `department_name` mà không có `employee_id` bị reject `422`.
- [x] Asset hiển thị nhân viên chịu trách nhiệm hiện tại.
- [x] Manager có thể assign và unassign trực tiếp từ asset workspace.
- [x] Chỉ asset `active` và chưa có active assignment mới xuất hiện trong danh sách available.
- [x] Asset đang `maintenance` hoặc `retired` bị chặn assign.
- [x] Dashboard employee đọc dữ liệu từ `/api/my-assigned-assets/dropdown`.
- [x] `/api/department-assets/dropdown` vẫn là alias compatibility.

## Maintenance

- [x] Maintenance type dùng nhóm vận hành thiết bị: inspection, preventive, software_update, hardware_upgrade, calibration, repair, cleaning, replacement, other.
- [x] Manager/technician tạo và cập nhật maintenance.
- [x] Maintenance có chi tiết xử lý, technician, chi phí và thời điểm hoàn tất.
- [x] Báo cáo và dashboard đọc được trạng thái maintenance.

## Requests

- [x] Employee tạo phiếu báo sự cố thiết bị mình phụ trách.
- [x] Employee tạo phiếu xin vật tư hoặc linh kiện.
- [x] Manager duyệt hoặc từ chối request.

## Inventory Và Valuation

- [x] Kiểm kê theo đợt.
- [x] Tính giá trị còn lại theo purchase cost, useful life và salvage value.
- [x] Theo dõi warranty expiring soon.
- [x] Location filter dùng canonical location code/name.
- [x] Dashboard manager và technician hiển thị valuation summary, phân bổ thiết bị và depreciation alert.

## Depreciation Và Disposal

- [x] Depreciation `75%` chưa được đề xuất thu hủy.
- [x] Depreciation `> 75%` được đưa vào danh sách đề xuất thu hủy.
- [x] Khi retire asset: `status = retired`.
- [x] Khi retire asset: `location_id = null` và legacy `location = null`.
- [x] Khi retire asset: active responsible assignment được đóng.

## Purchase Orders Và Supplier

- [x] Manager/technician tạo đơn mua hàng.
- [x] Form purchase order gom khối nhà cung cấp, danh sách dòng hàng và tổng tiền.
- [x] Supplier chỉ xem đơn thuộc supplier của mình.
- [x] Supplier cập nhật trạng thái preparing, shipping, delivered.

## Legacy Compatibility

- [x] Endpoint cũ về mã cá nhân trả `410 Gone`.
- [x] Endpoint cũ về personal asset/history trả `410 Gone`.
- [x] Endpoint cũ về available-for-loan trả `410 Gone`.
- [x] Endpoint cũ về employee contract trả `410 Gone`.
- [x] Endpoint removed scope trả JSON message rõ ràng thay vì lỗi mơ hồ.
- [x] Không drop migration lịch sử trong cleanup này.

## Test Và Build

- [x] `php artisan test`
- [x] `npm run check:i18n`
- [x] `npm run build`
- [x] `git diff --check`
- [ ] Smoke test: tạo location -> tạo asset -> gắn responsible employee -> employee thấy asset -> retire asset -> location/responsible employee biến mất.
