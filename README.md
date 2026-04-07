# Mesoco Dental Asset Management

README này chỉ là trang vào nhanh. Tài liệu chi tiết của dự án nằm trong [docs/README.md](docs/README.md).

## 1. Phạm vi hiện tại

Hệ thống đang được chốt theo 5 phân hệ chính:

1. Quản lý danh mục và hồ sơ
2. Quản lý cấp phát
3. Quản lý bảo trì sửa chữa
4. Quản lý thu hủy
5. Báo cáo và thống kê

Luồng nghiệp vụ quan trọng nhất:

`nhân viên / bác sĩ báo cáo sự cố -> quản lý -> kỹ thuật viên`

## 2. Khởi động nhanh

### Thiết lập

```bash
composer install
npm install
copy .env.example .env
php artisan key:generate
php artisan migrate --force
npm run build
```

Hoặc:

```bash
composer run setup
```

### Chạy môi trường dev

```bash
composer run dev
```

### Build và test

```bash
npm run build
php artisan test
```

## 3. Tài liệu chính

- [Mục lục tài liệu](docs/README.md)
- [Stack công nghệ](docs/STACK.md)
- [Tính năng theo vai trò](docs/ROLE_FEATURES.md)
- [Ma trận RBAC](docs/RBAC_MATRIX.md)
- [Quy ước database](docs/DB_CONVENTIONS.md)
- [Dữ liệu mẫu và seeder](docs/SEED_DATA.md)
- [Checklist nghiệm thu](docs/feat_role.md)

## 4. Ghi chú ngắn

- Role chuẩn hiện hành là `manager`, `technician`, `doctor`, `employee`.
- `technician` hiện giữ toàn bộ quyền vận hành mà trước đây nhóm hành chính/nhân sự cũ dùng.
- Một số phần cũ vẫn còn trong repo để giữ tương thích, nhưng luồng sản phẩm chính đã được dồn về 5 phân hệ nêu trên.
