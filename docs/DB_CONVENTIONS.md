# Quy ước database

## 1. Nguyên tắc chung

- Mỗi bảng nghiệp vụ dùng `id` làm Primary Key nếu không phải bảng pivot.
- Bảng pivot như `account_roles` và `role_permissions` dùng composite Primary Key để tránh trùng quan hệ.
- Mọi liên kết nghiệp vụ chính đều có Foreign Key rõ ràng.
- `users.role` vẫn là role canonical để tương thích code cũ, nhưng `users.role_id` và `account_roles` là liên kết chuẩn về bảng `roles`.
- `requests`, `request_items`, `request_events` đã bị loại khỏi scope chính theo yêu cầu mới.

## 2. Tài khoản và phân quyền

### 2.1. `roles`

- Primary Key: `id`
- Unique: `code`
- Dùng cho 4 role canonical: `manager`, `technician`, `employee`, `supplier`

### 2.2. `permissions`

- Primary Key: `id`
- Unique: `code`
- Lưu quyền nghiệp vụ dạng nhỏ, ví dụ `inventory.manage`, `maintenance.manage`, `reports.view`

### 2.3. `role_permissions`

- Composite Primary Key: `role_id`, `permission_id`
- Foreign Key:
  - `role_id -> roles.id`
  - `permission_id -> permissions.id`
- Dùng để mô tả role nào có permission nào.

### 2.4. `account_roles`

- Composite Primary Key: `user_id`, `role_id`
- Foreign Key:
  - `user_id -> users.id`
  - `role_id -> roles.id`
- Dùng để thể hiện tài khoản được gán role nào. Hiện code vẫn giữ một role chính tại `users.role_id`.

## 3. Bốn nghiệp vụ chính

### 3.1. Cấp phát / đơn hàng

`purchase_orders`

- Primary Key: `id`
- Foreign Key:
  - `supplier_id -> suppliers.id`
  - `requested_by_user_id -> users.id`
  - `approved_by_user_id -> users.id`

`purchase_order_items`

- Primary Key: `id`
- Foreign Key:
  - `purchase_order_id -> purchase_orders.id`
  - `asset_id -> assets.id`
  - `category_id -> categories.id`
- `line_total` luôn do backend tính từ `qty * unit_price`.

### 3.2. Bảo trì

`maintenance_events`

- Primary Key: `id`
- Foreign Key:
  - `asset_id -> assets.id`
  - `assigned_to_user_id -> users.id`
  - `created_by -> users.id`
  - `updated_by -> users.id`

`maintenance_details`

- Primary Key: `id`
- Foreign Key:
  - `maintenance_event_id -> maintenance_events.id`
  - `asset_id -> assets.id`
  - `technician_user_id -> users.id`
  - `supplier_id -> suppliers.id`
- Bảng này là bảng chi tiết chuẩn cho nghiệp vụ bảo trì. `repair_logs` được giữ để tương thích legacy.

### 3.3. Thu hủy

`disposals`

- Primary Key: `id`
- Foreign Key:
  - `asset_id -> assets.id`
  - `disposed_by_user_id -> users.id`
  - `approved_by_user_id -> users.id`

`disposal_details`

- Primary Key: `id`
- Foreign Key:
  - `disposal_id -> disposals.id`
  - `asset_id -> assets.id`
- Bảng này lưu chi tiết tài sản thu hủy, tình trạng xử lý, giá trị còn lại và số tiền thu hồi.

### 3.4. Kiểm kê

`inventory_checks`

- Primary Key: `id`
- Foreign Key:
  - `created_by_user_id -> users.id`
  - `completed_by_user_id -> users.id`
- Đại diện cho một đợt kiểm kê.

`inventory_check_items`

- Primary Key: `id`
- Foreign Key:
  - `inventory_check_id -> inventory_checks.id`
  - `asset_id -> assets.id`
  - `counted_by_user_id -> users.id`
- Unique: `inventory_check_id`, `asset_id`
- Lưu từng dòng kiểm kê tài sản: trạng thái kỳ vọng, trạng thái thực tế, vị trí kỳ vọng, vị trí thực tế và kết quả.

## 4. Bảng lõi hỗ trợ

### 4.1. `users`

Cột chính:

- `employee_code`
- `employee_id`
- `supplier_id`
- `role`
- `role_id`
- `status`
- `must_change_password`

Quy ước:

- User nội bộ liên kết qua `employee_id`.
- Supplier portal liên kết qua `supplier_id`.
- Một user không nên đồng thời dùng cả `employee_id` và `supplier_id`.

### 4.2. `assets`

Foreign Key chính:

- `category_id -> categories.id`
- `supplier_id -> suppliers.id`

`assets.status` là nguồn trạng thái vận hành của tài sản: `active`, `off_service`, `maintenance`, `retired`.

### 4.3. `suppliers`

Dùng cho:

- danh mục nhà cung cấp
- tài khoản supplier portal
- đơn hàng
- bảo trì có hỗ trợ bên ngoài

## 5. Migration liên quan gần nhất

- `2026_04_07_180000_create_erd_alignment_tables.php`
- `2026_04_07_180100_align_existing_tables_with_erd.php`
- `2026_04_07_190000_normalize_roles_for_dfd_scope.php`
- `2026_04_07_230000_merge_doctor_into_employee_role.php`
- `2026_04_09_140000_add_supplier_role_and_purchase_order_payment_method.php`
- `2026_04_19_090000_align_business_tables_with_client_scope.php`
