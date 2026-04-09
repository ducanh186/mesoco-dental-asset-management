# Ma trận phân quyền

## 1. Vai trò canonical

- `manager`
- `technician`
- `employee`
- `supplier`

## 2. Ma trận quyền theo module

| Module / API | manager | technician | employee | supplier |
| --- | --- | --- | --- | --- |
| `/api/profile` | Có | Có | Có | Có |
| `/api/assets` | Có | Có | Không | Không |
| `/api/inventory/*` | Có | Có | Không | Không |
| `/api/locations` | Có | Có | Không | Không |
| `/api/suppliers` | Có | Có | Không | Không |
| `/api/purchase-orders` GET | Có | Có | Không | Có, chỉ đơn của mình |
| `/api/purchase-orders` POST/PUT/DELETE | Có | Có | Không | Không |
| `/api/purchase-orders/{id}/status` | Có | Có | Không | Có, chỉ đơn của mình |
| `/api/requests` | Có | Có | Có | Không |
| `/api/review-requests` | Có | Không | Không | Không |
| `/api/maintenance-events` | Có | Có | Không | Không |
| `/api/disposal/*` | Có | Có | Không | Không |
| `/api/reports/*` | Có | Không | Không | Không |
| `/api/users` list/create/show | Có | Có | Không | Không |
| `/api/users/{id}/role` | Có | Không | Không | Không |
| `/api/roles` | Có | Không | Không | Không |

## 3. Route group hiện tại

### 3.1. Mọi người dùng đã đăng nhập

- `/api/me`
- `/api/change-password`
- `/api/profile`

### 3.2. Nội bộ: manager + technician + employee

- QR
- my-assets
- shifts
- checkin
- my-asset-history
- requests
- feedback

### 3.3. Manager בלבד

- review queue
- report summary/export
- update user role
- delete user

### 3.4. Manager + technician

- employees
- users list/create/show
- assets
- inventory
- locations
- suppliers
- maintenance
- disposal
- purchase order create/update/delete

### 3.5. Manager + technician + supplier

- purchase order list/show
- purchase order status update

## 4. Ràng buộc quan trọng

- Supplier không được nhìn thấy route người dùng nội bộ như `requests`, `my-assets`, `qr-scan`
- Supplier chỉ nhìn thấy đơn hàng có `supplier_id` trùng với `users.supplier_id`
- Manager không được tự đổi role của chính mình qua API đổi role
- Tài khoản supplier không thể đổi sang role nội bộ nếu không có `employee_id`
- Tài khoản nội bộ không thể đổi sang `supplier` nếu không có `supplier_id`
