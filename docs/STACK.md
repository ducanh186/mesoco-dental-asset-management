# Stack kỹ thuật

## 1. Công nghệ chính

- Backend: Laravel 12, Sanctum, Eloquent ORM
- Frontend: React, React Router, Vite
- Database dev/test: SQLite
- Styling: CSS nội bộ + component UI dùng lại trong `resources/js/components/ui`

## 2. Cấu trúc repo quan trọng

- `app/Http/Controllers`: API controller theo từng phân hệ
- `app/Http/Requests`: validation request
- `app/Models`: model Eloquent
- `database/migrations`: schema và các migration chuẩn hóa
- `database/seeders`: dữ liệu demo
- `resources/js/pages`: màn hình React
- `resources/js/services/api.js`: client API cho frontend
- `routes/api.php`: map route và RBAC
- `tests/Feature`: test API và nghiệp vụ

## 3. Các module đang hoạt động

### 3.1. Danh mục và hồ sơ

- `assets`
- `locations`
- `suppliers`
- `users`
- `employees`
- `purchase_orders`

### 3.2. Cấp phát

- `requests`
- `review-requests`
- `asset assignments`

### 3.3. Bảo trì và sửa chữa

- `maintenance_events`
- `repair_logs`
- `off service`

### 3.4. Thu hủy

- `disposals`

### 3.5. Báo cáo

- `reports/summary`
- `reports/export`

## 4. Role hiện tại trong code

- `manager`: duyệt, điều phối, báo cáo, quản lý user/role
- `technician`: vận hành danh mục, cấp phát, bảo trì, thu hủy, đơn hàng
- `employee`: người dùng nội bộ đầu cuối
- `supplier`: tài khoản nhà cung cấp, chỉ xem và cập nhật đơn hàng của chính mình

Legacy mapping vẫn được giữ để không gãy dữ liệu cũ:

- `admin -> manager`
- `hr -> technician`
- `doctor -> employee`
- `staff -> employee`

## 5. Điểm kỹ thuật mới nhất

- `users` giờ có thể liên kết `employee_id` hoặc `supplier_id`
- `supplier` là canonical role, không còn chỉ là danh mục
- `purchase_orders` có `payment_method`
- `purchase_order_items` lưu sản phẩm, số lượng, đơn giá, thành tiền
- trạng thái đơn hàng chuẩn hóa thành `preparing`, `shipping`, `delivered`
- `/api/profile` hỗ trợ cả profile nhân viên và profile nhà cung cấp

## 6. Lệnh làm việc

Chạy backend + frontend dev:

```bash
composer run dev
```

Build frontend:

```bash
npm run build
```

Chạy migrate:

```bash
php artisan migrate --force
```

Chạy test:

```bash
php artisan test
```

Chạy một nhóm test quan trọng:

```bash
php artisan test tests/Feature/PurchaseOrderApiTest.php tests/Feature/ProfileTest.php
```
