# Chức Năng Theo Role

Tài liệu này mô tả hệ thống từ góc nhìn người dùng. Cách đọc đơn giản: mỗi role chỉ thấy những module phục vụ công việc của họ.

## Manager

Manager là người chịu trách nhiệm quản lý tổng thể tài sản IT.

Manager có thể:

- Xem dashboard tổng quan tài sản, bảo trì, kiểm kê và đơn mua hàng.
- Tạo, sửa, xóa tài sản IT.
- Quản lý vị trí đặt tài sản.
- Gắn hoặc thu hồi nhân viên chịu trách nhiệm cho tài sản.
- Duyệt hoặc từ chối request của nhân viên.
- Xem báo cáo và export dữ liệu.
- Quản lý user và role.
- Theo dõi purchase order của tất cả nhà cung cấp.
- Thực hiện disposal cho tài sản không còn dùng.

## Technician

Technician là người vận hành kỹ thuật hằng ngày.

Technician có thể:

- Quản lý danh mục asset.
- Cập nhật trạng thái, vị trí và nhân viên chịu trách nhiệm.
- Tạo và xử lý maintenance event.
- Thực hiện inventory check.
- Theo dõi valuation, depreciation và warranty.
- Tạo purchase order khi cần bổ sung thiết bị hoặc linh kiện.
- Xử lý disposal theo quy trình vận hành.

Technician không duyệt request và không xem báo cáo cấp quản lý nếu không có role manager.

## Employee

Employee là nhân viên công ty chịu trách nhiệm sử dụng hoặc theo dõi một số thiết bị.

Employee có thể:

- Xem dashboard các thiết bị mình phụ trách.
- Tạo request báo sự cố cho thiết bị mình phụ trách.
- Tạo request xin vật tư/linh kiện IT.
- Xem trạng thái request của mình.
- Cập nhật hồ sơ cá nhân.

Employee không tự chuyển người phụ trách cho tài sản. Nếu cần chuyển trách nhiệm, technician hoặc manager cập nhật assignment.

## Supplier

Supplier là tài khoản nhà cung cấp.

Supplier có thể:

- Xem purchase order liên quan đến supplier của mình.
- Cập nhật trạng thái chuẩn bị, đang giao, đã giao.
- Xem hồ sơ supplier.

Supplier không thấy asset catalog nội bộ, request nội bộ, maintenance, inventory hay report.

## Flow Sử Dụng Thực Tế

1. Manager hoặc technician tạo vị trí `LOC-001 - Kho IT`.
2. Manager hoặc technician tạo asset mới khi công ty mua laptop.
3. Technician đặt laptop vào vị trí phù hợp và gắn nhân viên chịu trách nhiệm.
4. Employee thấy laptop trong danh sách thiết bị mình phụ trách và gửi request nếu laptop lỗi.
5. Manager duyệt request và gán technician xử lý.
6. Technician tạo maintenance event, cập nhật kết quả và chi phí.
7. Inventory module ghi nhận giá trị còn lại và tình trạng thiết bị.
8. Khi depreciation `> 75%`, hệ thống đưa laptop vào danh sách đề xuất thu hủy.
9. Khi asset bị thu hủy, vị trí và người phụ trách active được clear.
