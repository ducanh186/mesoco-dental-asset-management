# Checklist Nghiệm Thu Theo Scope Mới

Scope mới: quản lý trang thiết bị IT theo phòng ban cho công ty công nghệ. Hệ thống không còn xem mượn/trả cá nhân hoặc quét mã cá nhân là flow chính.

## Danh Mục Thiết Bị IT

- [x] Asset có category IT như Laptop, Desktop, Monitor, Network, Server, Peripheral, Printer.
- [x] Asset lưu ngày mua, giá mua, thời hạn sử dụng, giá trị thu hồi và bảo hành.
- [x] Asset có trạng thái active, maintenance, off service, retired.
- [x] API asset không expose payload định danh cũ trong response active.

## Bàn Giao Phòng Ban

- [x] `POST /api/assets/{id}/assign` nhận `{ department_name: string }`.
- [x] Asset hiển thị phòng ban đang nhận bàn giao.
- [x] Dashboard employee đọc dữ liệu từ `/api/department-assets/dropdown`.
- [x] Không còn page mượn/trả cá nhân trong frontend route active.

## Maintenance

- [x] Maintenance type chuyển sang IT-safe: inspection, preventive, software_update, hardware_upgrade, calibration, repair, cleaning, replacement, other.
- [x] Manager/technician tạo và cập nhật maintenance.
- [x] Maintenance có chi tiết xử lý, technician, chi phí và thời điểm hoàn tất.
- [x] Báo cáo và dashboard đọc được trạng thái maintenance.

## Requests

- [x] Employee tạo phiếu báo sự cố thiết bị.
- [x] Employee tạo phiếu xin vật tư hoặc linh kiện IT.
- [x] Manager duyệt hoặc từ chối request.
- [x] Request mượn/trả bị chặn bằng validation.

## Inventory Và Valuation

- [x] Kiểm kê theo đợt.
- [x] Tính giá trị còn lại theo purchase cost, useful life và salvage value.
- [x] Theo dõi warranty expiring soon.
- [x] Export/report không dùng wording domain cũ.

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

- [x] `npm run check:i18n` đồng bộ key EN/VI.
- [x] `npm run build` pass.
- [x] `php artisan test` pass.
- [ ] Smoke test tạo asset IT, bàn giao phòng ban, tạo request, duyệt request, tạo maintenance, xem inventory valuation.
