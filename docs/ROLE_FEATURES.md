# Tính năng theo vai trò

## 1. Manager

Manager có quyền hệ thống và quyền điều phối:

- xem toàn bộ dashboard quản trị
- duyệt phiếu cấp phát và phiếu báo sự cố
- gán kỹ thuật viên xử lý sự cố
- quản lý tài khoản người dùng và role
- quản lý danh mục thiết bị, vị trí, nhà cung cấp
- tạo, sửa, xóa đơn hàng
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
- xem danh sách đơn hàng của tất cả nhà cung cấp

Lưu ý:

- technician không xem báo cáo tổng hợp cấp quản trị
- technician không đổi role của người dùng

## 3. Employee

Employee là người dùng nội bộ đầu cuối. Bác sĩ dùng chung role này.

Employee có thể:

- xem thiết bị được giao
- quét QR để tra cứu
- tạo phiếu mượn thiết bị
- tạo phiếu báo sự cố
- theo dõi phiếu của chính mình
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
- tạo phiếu cấp phát hoặc phiếu sự cố
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

- Manager: duyệt và điều phối
- Technician: tham gia vận hành và xem queue phù hợp
- Employee: tạo và theo dõi phiếu của chính mình
- Supplier: không truy cập

### 5.3. Bảo trì và sửa chữa

- Manager: giám sát và can thiệp
- Technician: vai trò chính
- Employee: chỉ báo sự cố
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

### 5.6. Đơn hàng nhà cung cấp

- Manager: tạo, sửa, xóa, xem mọi đơn hàng
- Technician: tạo, sửa, xóa, xem mọi đơn hàng
- Employee: không truy cập
- Supplier: chỉ xem đơn của mình và cập nhật trạng thái
