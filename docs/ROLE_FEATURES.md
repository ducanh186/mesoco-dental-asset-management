# Chức Năng Theo Role

Tài liệu này mô tả hệ thống từ góc nhìn người dùng. Cách đọc đơn giản: mỗi role chỉ thấy những module phục vụ công việc của họ.

## Manager

Manager là người chịu trách nhiệm quản lý tổng thể thiết bị IT.

Manager có thể:

- Xem dashboard tổng quan với giá trị tồn kho, thiết bị gián đoạn, hàng đợi request chờ duyệt, phân bổ theo bộ phận và cảnh báo khấu hao.
- Tra cứu thiết bị theo mã, danh mục, vị trí hoặc nhân viên đang giữ ngay từ topbar hoặc asset workspace.
- Tạo, sửa, xóa thiết bị IT.
- Quản lý vị trí đặt thiết bị.
- Gắn hoặc thu hồi nhân viên chịu trách nhiệm cho thiết bị.
- Mở workspace bảo trì trực tiếp từ danh sách hoặc chi tiết thiết bị.
- Duyệt hoặc từ chối request của nhân viên.
- Xem báo cáo và export dữ liệu.
- Quản lý user và role.
- Theo dõi purchase order của tất cả nhà cung cấp với form chia khối nhà cung cấp và danh sách thiết bị cần đặt.
- Thực hiện disposal cho thiết bị không còn dùng.

## Technician

Technician là người vận hành kỹ thuật hằng ngày.

Technician có thể:

- Xem dashboard vận hành với giá trị tồn kho, maintenance đang chạy, xu hướng thiết bị và cảnh báo khấu hao cao.
- Quản lý danh mục asset.
- Tra cứu thiết bị theo mã, danh mục, vị trí hoặc người đang giữ.
- Cập nhật trạng thái, vị trí và nhân viên chịu trách nhiệm.
- Tạo và xử lý maintenance event.
- Thực hiện inventory check.
- Theo dõi valuation, depreciation và warranty.
- Tạo purchase order khi cần bổ sung thiết bị hoặc linh kiện, chưa bắt buộc nhập giá ở bước tạo đơn.
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

Employee đăng nhập bằng `employee_code`, không tự chuyển người phụ trách cho thiết bị và không truy cập asset workspace nội bộ. Nếu cần chuyển trách nhiệm, technician hoặc manager cập nhật assignment.

## Supplier

Supplier là tài khoản nhà cung cấp.

Supplier có thể:

- Xem purchase order liên quan đến supplier của mình.
- Cập nhật trạng thái chuẩn bị, đang giao, đã giao.
- Xem hồ sơ supplier.

Supplier không thấy asset catalog nội bộ, request nội bộ, maintenance, inventory hay report. Tài khoản supplier không được seed mặc định mà cần tạo riêng.

## Flow Sử Dụng Thực Tế

1. Manager hoặc technician mở `Asset Workspace` và tìm laptop theo mã thiết bị, vị trí hoặc người đang giữ.
2. Manager hoặc technician tạo thiết bị mới khi công ty mua laptop.
3. Technician đặt laptop vào vị trí phù hợp và gắn nhân viên chịu trách nhiệm.
4. Employee thấy laptop trong danh sách thiết bị mình phụ trách và gửi request nếu laptop lỗi.
5. Manager duyệt request và gán technician xử lý.
6. Technician mở maintenance trực tiếp từ asset, cập nhật kết quả và chi phí.
7. Dashboard và inventory module ghi nhận giá trị còn lại, tình trạng thiết bị và cảnh báo khấu hao.
8. Nếu cần bổ sung thiết bị, manager hoặc technician tạo purchase order với danh sách thiết bị, đơn vị, số lượng và ghi chú.
9. Khi depreciation `> 75%`, hệ thống đưa laptop vào danh sách đề xuất thu hủy.
10. Khi thiết bị bị thu hủy, vị trí và người phụ trách active được clear.
