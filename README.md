# Mesoco Dental Asset Management

`README.md` ở root chỉ dùng để điều hướng. Tài liệu chính của dự án nằm trong [docs/README.md](docs/README.md).

## Phạm vi hiện tại

Hệ thống đang bám đúng 5 nhiệm vụ chính của DFD mức 0:

1. Quản lý danh mục và hồ sơ
2. Quản lý cấp phát
3. Quản lý bảo trì và sửa chữa
4. Quản lý thu hủy
5. Báo cáo và thống kê

Các chốt nghiệp vụ đang áp dụng:

- `employee` là vai trò người dùng nội bộ đầu cuối; bác sĩ dùng chung vai trò này
- `manager` thay cho `admin`
- `technician` giữ quyền vận hành nội bộ
- `supplier` là vai trò cổng nhà cung cấp, chỉ theo dõi và cập nhật đơn hàng của chính mình
- module hợp đồng nhân viên không còn trong phạm vi sản phẩm chính

Mở rộng mới nhất:

- thêm role `supplier`
- thêm module `purchase_orders` và `purchase_order_items`
- đơn hàng có các trường: sản phẩm, số lượng, đơn giá, thành tiền, phương thức thanh toán
- trạng thái đơn hàng: `preparing`, `shipping`, `delivered`

## Khởi động nhanh

```bash
composer install
npm install
copy .env.example .env
php artisan key:generate
php artisan migrate --force
npm run build
```

Hoặc dùng script có sẵn:

```bash
composer run setup
```

Chạy môi trường phát triển:

```bash
composer run dev
```

Chạy test:

```bash
php artisan test
```

## Đi tới tài liệu

- [Mục lục tài liệu](docs/README.md)
- [Stack công nghệ](docs/STACK.md)
- [Tính năng theo vai trò](docs/ROLE_FEATURES.md)
- [Ma trận phân quyền](docs/RBAC_MATRIX.md)
- [Quy ước database](docs/DB_CONVENTIONS.md)
- [Seeder và dữ liệu mẫu](docs/SEED_DATA.md)
- [Checklist chốt phạm vi](docs/feat_role.md)
