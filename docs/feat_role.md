# Checklist chốt phạm vi và nghiệm thu

## 1. Chốt từ khách hàng

- nhân viên và bác sĩ là một
- bỏ role `admin`, thay bằng `manager`
- kỹ thuật viên giữ quyền vận hành nội bộ
- bỏ module hợp đồng nhân viên khỏi phạm vi chính
- chỉ tập trung vào 4 nghiệp vụ chính của ERD hiện tại
- nhà cung cấp vẫn giữ lại như một thực thể quan trọng
- thêm role `supplier`
- thêm quản lý đơn hàng với sản phẩm, số lượng, đơn giá, thành tiền, phương thức thanh toán
- quản lý trạng thái đơn hàng: `preparing`, `shipping`, `delivered`
- bỏ bảng yêu cầu khỏi scope chính
- thêm nghiệp vụ kiểm kê với bảng chính và bảng chi tiết
- bổ sung Primary Key và Foreign Key rõ ràng cho tài khoản/quyền và các bảng nghiệp vụ

## 2. Checklist triển khai

### 2.1. Vai trò

- [x] `doctor` collapse về `employee`
- [x] `manager` là role quản trị duy nhất
- [x] thêm canonical role `supplier`
- [x] frontend và backend đều normalize role thống nhất

### 2.2. Phân hệ nội bộ

- [x] danh mục & hồ sơ
- [x] cấp phát
- [x] bảo trì & sửa chữa
- [x] thu hủy
- [x] kiểm kê
- [x] báo cáo & thống kê

### 2.3. Nhà cung cấp và đơn hàng

- [x] có danh mục `suppliers`
- [x] supplier có thể có tài khoản đăng nhập riêng
- [x] có bảng `purchase_orders`
- [x] có bảng `purchase_order_items`
- [x] đơn hàng có `payment_method`
- [x] backend tự tính `line_total` và `total_amount`
- [x] supplier chỉ xem đơn của chính mình
- [x] supplier cập nhật được trạng thái đơn hàng

### 2.4. Bảng detail theo nghiệp vụ

- [x] đơn hàng có `purchase_order_items`
- [x] bảo trì có `maintenance_details`
- [x] thu hủy có `disposal_details`
- [x] kiểm kê có `inventory_check_items`

### 2.5. Hồ sơ người dùng

- [x] employee profile giữ nguyên shape cũ
- [x] supplier profile có shape riêng
- [x] `/api/profile` xử lý được cả 2 loại profile

### 2.6. Loại khỏi phạm vi chính

- [x] route hợp đồng nhân viên trả `410 Gone`
- [x] route request workflow trả `410 Gone`
- [x] supplier không vào được các module nội bộ như `my-assets`, `qr-scan`

## 3. Tiêu chí nghiệm thu nhanh

### 3.1. Nội bộ

- manager/technician vào được trang `purchase-orders`
- manager/technician tạo được đơn hàng có nhiều dòng sản phẩm
- hệ thống tự tính tổng tiền đúng

### 3.2. Supplier

- supplier đăng nhập được bằng tài khoản gắn với `suppliers`
- supplier chỉ thấy đơn hàng có `supplier_id` của mình
- supplier đổi được trạng thái từ `preparing` sang `shipping`, rồi `delivered`

### 3.3. Tài liệu

- [x] toàn bộ file `.md` trong `docs/` đã viết lại bằng tiếng Việt
- [x] `README.md` ở root chỉ còn vai trò điều hướng sang `docs/`
