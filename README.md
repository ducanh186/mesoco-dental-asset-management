# Mesoco IT Asset Management

Hệ thống quản lý trang thiết bị IT cho công ty công nghệ. Phạm vi hiện tại tập trung vào tài sản máy tính theo phòng ban: danh mục tài sản, bàn giao phòng ban, bảo trì, kiểm kê, khấu hao, thanh lý, đơn mua hàng và phiếu báo sự cố hoặc xin vật tư IT.

## Phạm Vi Nghiệp Vụ

- `Asset Catalog`: quản lý laptop, desktop, monitor, network device, server, printer, peripheral, mobile device, office IT và nhóm khác.
- `Department Handover`: thiết bị thuộc phòng ban nào, ngày bàn giao, trạng thái sử dụng và lịch sử thay đổi.
- `Maintenance`: quản lý lịch kiểm tra, sửa chữa, nâng cấp phần cứng, cập nhật phần mềm, vệ sinh và thay thế linh kiện.
- `Inventory & Valuation`: kiểm kê định kỳ, giá mua, khấu hao, giá trị còn lại, bảo hành và tình trạng sử dụng.
- `Purchase Orders`: quản lý đơn mua thiết bị, nhà cung cấp và trạng thái giao hàng.
- `Requests`: nhân viên báo sự cố thiết bị hoặc xin vật tư/linh kiện IT.
- `Disposal`: khóa sử dụng, thanh lý hoặc loại bỏ tài sản không còn dùng.

Các flow cũ như quét mã cá nhân, mượn/trả thiết bị và hợp đồng nhân viên đã bị gỡ khỏi UI active. API legacy vẫn trả JSON với HTTP `410 Gone` để client cũ không rơi vào lỗi mơ hồ.

## Stack

- Backend: Laravel 12, PHP 8.2, Laravel Sanctum.
- Frontend: React 19, Vite 7, Axios, custom i18n.
- Database: SQLite mặc định cho local/test, migration Laravel là nguồn sự thật.
- Test: PHPUnit feature tests, Vite production build, i18n key parity checker.

## Quick Start

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
npm run build
```

Chạy app local:

```bash
php artisan serve
npm run dev
```

Chạy kiểm tra:

```bash
npm run check:i18n
npm run build
php artisan test
```

## Tài Khoản Demo

Sau khi chạy `php artisan migrate --seed`, dùng các tài khoản mẫu:

| Role | Email | Password | Mục đích |
| --- | --- | --- | --- |
| manager | manager@mesoco.vn | password | Quản lý báo cáo, user, duyệt phiếu |
| technician | technician@mesoco.vn | password | Vận hành asset, maintenance, inventory |
| employee | employee@mesoco.vn | password | Xem thiết bị phòng ban và gửi request |
| supplier | supplier@mesoco.vn | password | Theo dõi purchase order của nhà cung cấp |

## Tài Liệu

- [docs/README.md](docs/README.md): mục lục tài liệu theo hướng báo cáo/luận văn.
- [docs/STACK.md](docs/STACK.md): Stack, cấu trúc repo và runtime flow.
- [docs/DB_CONVENTIONS.md](docs/DB_CONVENTIONS.md): quy ước database, enum và bảng legacy giữ lại.
- [docs/RBAC_MATRIX.md](docs/RBAC_MATRIX.md): quyền theo role.
- [docs/ROLE_FEATURES.md](docs/ROLE_FEATURES.md): chức năng theo từng người dùng.
- [docs/SEED_DATA.md](docs/SEED_DATA.md): seed data IT.
- [docs/CLASS_DIAGRAM.md](docs/CLASS_DIAGRAM.md): class diagram Mermaid.
- [docs/feat_role.md](docs/feat_role.md): checklist nghiệm thu theo yêu cầu mới.

## Quy Tắc Cleanup Hiện Tại

Không drop migration lịch sử và không đổi tên bảng/cột cũ trong lần cleanup này. Nếu sau này cần xóa vật lý bảng/cột legacy, cần lập một plan migration phá vỡ tương thích riêng, có backup và script chuyển dữ liệu.
