# Chức Năng Theo Role

Tài liệu này mô tả hệ thống từ góc nhìn người dùng. Cách đọc đơn giản: mỗi role chỉ thấy những module phục vụ công việc của họ.

## Manager

Manager là người chịu trách nhiệm quản lý tổng thể tài sản IT.

Manager có thể:

- Xem dashboard tổng quan tài sản, bảo trì, kiểm kê và đơn mua hàng.
- Tạo, sửa, xóa tài sản IT.
- Bàn giao tài sản cho phòng ban.
- Duyệt hoặc từ chối request của nhân viên.
- Xem báo cáo và export dữ liệu.
- Quản lý user và role.
- Theo dõi purchase order của tất cả nhà cung cấp.
- Thực hiện hoặc phê duyệt disposal cho tài sản không còn dùng.

## Technician

Technician là người vận hành kỹ thuật hằng ngày.

Technician có thể:

- Quản lý danh mục asset.
- Cập nhật trạng thái, vị trí, phòng ban bàn giao.
- Tạo và xử lý maintenance event.
- Thực hiện inventory check.
- Theo dõi valuation, depreciation và warranty.
- Tạo purchase order khi cần bổ sung thiết bị hoặc linh kiện.
- Xử lý disposal theo quy trình vận hành.

Technician không duyệt request và không xem báo cáo cấp quản lý nếu không có role manager.

## Employee

Employee là nhân viên công ty sử dụng thiết bị thuộc phòng ban.

Employee có thể:

- Xem dashboard thiết bị đã bàn giao cho phòng ban.
- Tạo request báo sự cố thiết bị.
- Tạo request xin vật tư/linh kiện IT.
- Xem trạng thái request của mình.
- Cập nhật hồ sơ cá nhân.

Employee không tự tạo luồng mượn/trả thiết bị. Nếu thiết bị cần chuyển phòng ban, technician hoặc manager cập nhật handover.

## Supplier

Supplier là tài khoản nhà cung cấp.

Supplier có thể:

- Xem purchase order liên quan đến supplier của mình.
- Cập nhật trạng thái chuẩn bị, đang giao, đã giao.
- Xem hồ sơ supplier.

Supplier không thấy asset catalog nội bộ, request nội bộ, maintenance, inventory hay report.

## Flow Sử Dụng Thực Tế

1. Manager hoặc technician tạo asset mới khi công ty mua laptop.
2. Technician bàn giao laptop cho phòng ban Engineering.
3. Employee trong Engineering thấy thiết bị phòng ban và gửi request nếu laptop lỗi.
4. Manager duyệt request và gán technician xử lý.
5. Technician tạo maintenance event, cập nhật kết quả và chi phí.
6. Inventory module ghi nhận giá trị còn lại và tình trạng thiết bị.
7. Khi thiết bị hết vòng đời, manager/technician đưa vào disposal.
