# Quy ước database

## 1. Nguyên tắc chung

- Role canonical được lưu ở `users.role` và chuẩn hóa thêm qua `users.role_id`
- User liên kết với đúng một profile nghiệp vụ:
  - nội bộ: `users.employee_id`
  - nhà cung cấp: `users.supplier_id`
- `employee_id` và `supplier_id` không phải cùng dùng cho một user theo nghiệp vụ
- Legacy role vẫn được normalize khi lưu user

## 2. Bảng lõi

### 2.1. `users`

Cột chính đang dùng:

- `employee_code`
- `employee_id`
- `supplier_id`
- `role`
- `role_id`
- `status`
- `must_change_password`

Ghi chú:

- `employee_code` vẫn là định danh đăng nhập cho mọi tài khoản
- supplier user cũng đăng nhập qua `employee_code`, thường lấy từ `suppliers.code`

### 2.2. `suppliers`

Dùng cho cả:

- danh mục nhà cung cấp
- profile gốc của supplier portal
- liên kết purchase order
- liên kết repair log khi sửa chữa thuê ngoài

### 2.3. `purchase_orders`

Cột chính:

- `order_code`
- `supplier_id`
- `requested_by_user_id`
- `approved_by_user_id`
- `order_date`
- `expected_delivery_date`
- `status`
- `total_amount`
- `payment_method`
- `note`

Enum trạng thái chuẩn:

- `preparing`
- `shipping`
- `delivered`

Legacy `draft` được normalize thành `preparing`.

### 2.4. `purchase_order_items`

Cột chính:

- `purchase_order_id`
- `item_name`
- `qty`
- `unit`
- `unit_price`
- `line_total`
- `asset_id` nullable
- `category_id` nullable
- `note`

Quy ước:

- `line_total` luôn được tính ở backend từ `qty * unit_price`
- `total_amount` của đơn hàng là tổng `line_total`

## 3. Quan hệ quan trọng

- `Supplier hasOne User`
- `User belongsTo Supplier`
- `Supplier hasMany PurchaseOrder`
- `PurchaseOrder hasMany PurchaseOrderItem`
- `PurchaseOrder belongsTo requester/approver user`

## 4. Profile API

`/api/profile` trả 2 shape dữ liệu:

### 4.1. Employee profile

- `profile_type = employee`
- `employee_code`
- `full_name`
- `position`
- `dob`
- `gender`
- `phone`
- `email`
- `address`

### 4.2. Supplier profile

- `profile_type = supplier`
- `supplier_code`
- `name`
- `contact_person`
- `phone`
- `email`
- `address`
- `note`

## 5. Các bảng vẫn còn nhưng ngoài scope chính

- `employee_contracts` chỉ còn để tương thích route cũ; API trả `410 Gone`
- các bảng legacy khác có thể còn trong repo để phục vụ migration/backfill hoặc test cũ

## 6. Migration liên quan gần nhất

- `2026_04_07_180000_create_erd_alignment_tables.php`
- `2026_04_07_180100_align_existing_tables_with_erd.php`
- `2026_04_07_190000_normalize_roles_for_dfd_scope.php`
- `2026_04_07_230000_merge_doctor_into_employee_role.php`
- `2026_04_09_140000_add_supplier_role_and_purchase_order_payment_method.php`
