# Ngăn xếp công nghệ

Tài liệu này mô tả stack đang dùng trong repo `mesoco-dental-asset-management`, các lệnh phát triển chính và cấu trúc thư mục quan trọng.

## 1. Tổng quan

Hệ thống hiện được xây dựng theo mô hình:

- Backend Laravel phục vụ API JSON và render shell của SPA.
- Frontend React chạy bằng Vite.
- Xác thực dùng Laravel Sanctum.
- Dữ liệu cốt lõi bám theo 5 phân hệ nghiệp vụ:
  - Quản lý danh mục và hồ sơ
  - Quản lý cấp phát
  - Quản lý bảo trì sửa chữa
  - Quản lý thu hủy
  - Báo cáo và thống kê

## 2. Backend

- Ngôn ngữ: `PHP ^8.2`
- Framework: `laravel/framework ^12.0`
- Xác thực: `laravel/sanctum ^4.2`
- Công cụ dev:
  - `laravel/pint`
  - `phpunit/phpunit ^11.5.3`
  - `laravel/pail`
  - `laravel/sail`

Thư mục chính:

- `app/Http/Controllers`: controller API
- `app/Http/Requests`: validation và authorize
- `app/Models`: model Eloquent
- `app/Policies`: RBAC và IDOR protection
- `app/Services`: nghiệp vụ nhiều bước, ví dụ `MaintenanceService`
- `database/migrations`: schema
- `database/seeders`: dữ liệu mẫu và đồng bộ schema
- `routes/api.php`: toàn bộ API sau đăng nhập

## 3. Frontend

- `react ^19.2.3`
- `react-dom ^19.2.3`
- `react-router-dom ^7.12.0`
- `vite ^7.0.7`
- `@vitejs/plugin-react ^5.1.2`
- `tailwindcss ^4.0.0`
- `axios ^1.13.2`
- `html5-qrcode ^2.3.8`

Thư mục chính:

- `resources/js/app.jsx`: router chính của SPA
- `resources/js/pages`: các màn hình
- `resources/js/layouts`: layout, sidebar, topbar
- `resources/js/components`: UI component và widget
- `resources/js/services/api.js`: client gọi API
- `resources/js/utils/roles.js`: chuẩn hóa role ở frontend
- `resources/css`: CSS/Tailwind

## 4. Cơ sở dữ liệu

Repo đang hỗ trợ tốt cho hai kiểu chạy:

- SQLite cục bộ để phát triển nhanh và chạy test.
- MySQL/MariaDB khi triển khai môi trường thực tế.

Các nhóm bảng nổi bật:

- Nhân sự và tài khoản:
  - `employees`
  - `users`
  - `roles`
- Danh mục và tài sản:
  - `assets`
  - `categories`
  - `locations`
  - `asset_assignments`
  - `asset_qr_identities`
  - `asset_checkins`
- Yêu cầu cấp phát và báo sự cố:
  - `requests`
  - `request_items`
  - `request_events`
  - `approvals`
- Bảo trì, sửa chữa, thu hủy:
  - `maintenance_events`
  - `repair_logs`
  - `disposals`
- Mở rộng mua sắm theo ERD:
  - `suppliers`
  - `purchase_orders`
  - `purchase_order_items`

## 5. Lệnh phát triển

### Thiết lập lần đầu

```bash
composer install
npm install
copy .env.example .env
php artisan key:generate
php artisan migrate --force
npm run build
```

Hoặc dùng script đã khai báo trong `composer.json`:

```bash
composer run setup
```

### Chạy môi trường phát triển

```bash
composer run dev
```

Lệnh này chạy đồng thời:

- `php artisan serve`
- `php artisan queue:listen`
- `php artisan pail`
- `npm run dev`

### Build frontend

```bash
npm run build
```

### Chạy test

```bash
php artisan test
```

Hoặc:

```bash
composer run test
```

## 6. Kiểm tra nhanh sau khi sửa code

Các lệnh thường dùng trong repo này:

```bash
php artisan test tests/Feature/RequestTest.php
php artisan test tests/Feature/MaintenanceTest.php
php artisan test tests/Feature/ReportTest.php
npm run build
```

## 7. Nguyên tắc kiến trúc đang áp dụng

- Quyền truy cập không dựa vào frontend ẩn nút.
- Backend chặn ở nhiều tầng:
  - route middleware
  - `FormRequest::authorize()`
  - policy
- Role cũ được normalize về 4 role chuẩn:
  - `manager`
  - `technician`
  - `doctor`
  - `employee`
- Luồng sự cố chuẩn:
  - người dùng tạo `JUSTIFICATION`
  - quản lý duyệt
  - chỉ định kỹ thuật viên
  - sinh `maintenance_events`
  - đồng bộ `repair_logs`

## 8. Tài liệu liên quan

- [Mục lục tài liệu](README.md)
- [Tính năng theo vai trò](ROLE_FEATURES.md)
- [Ma trận phân quyền API](RBAC_MATRIX.md)
- [Quy ước database](DB_CONVENTIONS.md)
- [Dữ liệu mẫu và seeder](SEED_DATA.md)
- [Checklist nghiệm thu theo vai trò](feat_role.md)
