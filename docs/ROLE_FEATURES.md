# Tính năng theo vai trò

## 1. Manager

Manager có quyền hệ thống và quyền điều phối:

- xem toàn bộ dashboard quản trị
- quản lý tài khoản người dùng và role
- quản lý danh mục thiết bị, vị trí, nhà cung cấp
- tạo, sửa, xóa đơn hàng
- tạo và hoàn tất đợt kiểm kê
- xem báo cáo và thống kê
- tham gia bảo trì/thu hủy khi cần

## 2. Technician

Technician là vai trò vận hành nội bộ:

- quản lý danh mục thiết bị
- quản lý vị trí
- quản lý nhà cung cấp
- tạo user nội bộ mức `employee`
- tiếp nhận và xử lý bảo trì/sửa chữa
- thao tác khóa/mở trạng thái off-service
- xử lý thu hủy/thanh lý
- tạo, sửa, xóa đơn hàng
- tạo và cập nhật chi tiết kiểm kê
- xem danh sách đơn hàng của tất cả nhà cung cấp

Lưu ý:

- technician không xem báo cáo tổng hợp cấp quản trị
- technician không đổi role của người dùng

## 3. Employee

Employee là người dùng nội bộ đầu cuối. Bác sĩ dùng chung role này.

Employee có thể:

- xem thông tin chung của tài sản theo phạm vi được cấp
- cập nhật hồ sơ cá nhân

Employee không có quyền:

- vào module danh mục nội bộ
- vào module bảo trì/thu hủy
- vào module báo cáo
- vào module đơn hàng

## 4. Supplier

Supplier là vai trò mới cho nhà cung cấp.

Supplier có thể:

- đăng nhập bằng tài khoản gắn với bản ghi `suppliers`
- xem dashboard đơn hàng của chính mình
- xem danh sách đơn hàng thuộc nhà cung cấp của mình
- cập nhật trạng thái đơn hàng: `preparing`, `shipping`, `delivered`
- cập nhật hồ sơ nhà cung cấp của chính mình

Supplier không có quyền:

- xem thiết bị nội bộ
- xem báo cáo quản trị
- quản lý danh mục, vị trí, user hoặc tài sản
- xem đơn hàng của nhà cung cấp khác

## 5. Theo phân hệ

### 5.1. Quản lý danh mục và hồ sơ

- Manager: toàn quyền
- Technician: toàn quyền vận hành
- Employee: không truy cập
- Supplier: chỉ truy cập hồ sơ của chính supplier qua trang profile

### 5.2. Quản lý cấp phát

- Manager: tạo và kiểm soát đơn hàng/cấp phát
- Technician: tham gia vận hành, tạo đơn hàng và bàn giao tài sản theo phòng ban
- Employee: không còn là đối tượng nhận tài sản trực tiếp trong scope chính
- Supplier: không truy cập

### 5.3. Bảo trì và sửa chữa

- Manager: giám sát và can thiệp
- Technician: vai trò chính
- Employee: không truy cập module nội bộ
- Supplier: không truy cập module nội bộ

### 5.4. Thu hủy

- Manager: phê duyệt/giám sát
- Technician: thao tác chính
- Employee: không truy cập
- Supplier: không truy cập

### 5.5. Báo cáo

- Manager: truy cập
- Technician: không truy cập báo cáo quản trị
- Employee: không truy cập
- Supplier: không truy cập

### 5.6. Kiểm kê

- Manager: tạo, xem, hoàn tất đợt kiểm kê
- Technician: tạo, xem, cập nhật chi tiết kiểm kê
- Employee: không truy cập
- Supplier: không truy cập

### 5.7. Đơn hàng nhà cung cấp

- Manager: tạo, sửa, xóa, xem mọi đơn hàng
- Technician: tạo, sửa, xóa, xem mọi đơn hàng
- Employee: không truy cập
- Supplier: chỉ xem đơn của mình và cập nhật trạng thái
