# Mesoco IT Asset Management

Hệ thống quản lý trang thiết bị IT cho công ty công nghệ. Phạm vi hiện tại tập trung vào tài sản theo vị trí đặt và nhân viên chịu trách nhiệm: tra cứu danh mục tài sản, bàn giao trực tiếp, bảo trì, kiểm kê, khấu hao, thanh lý, đơn mua hàng và phiếu báo sự cố hoặc xin vật tư IT.

## Phạm Vi Nghiệp Vụ

- `Asset Catalog`: quản lý laptop, desktop, monitor, network device, server, printer, peripheral, mobile device, office IT và nhóm khác.
- `Responsible Handover`: thiết bị đang ở vị trí nào, ai đang chịu trách nhiệm và lịch sử bàn giao active.
- `Maintenance`: quản lý lịch kiểm tra, sửa chữa, nâng cấp phần cứng, cập nhật phần mềm, vệ sinh và thay thế linh kiện.
- `Inventory & Valuation`: kiểm kê định kỳ, giá mua, khấu hao, giá trị còn lại, bảo hành và tình trạng sử dụng.
- `Purchase Orders`: quản lý đơn mua thiết bị, nhà cung cấp và trạng thái giao hàng.
- `Requests`: nhân viên báo sự cố thiết bị hoặc xin vật tư/linh kiện IT.
- `Disposal`: khóa sử dụng, thanh lý hoặc loại bỏ tài sản không còn dùng.

Các flow cũ như quét mã cá nhân, mượn/trả thiết bị và hợp đồng nhân viên đã bị gỡ khỏi UI active. API legacy vẫn trả JSON với HTTP `410 Gone` để client cũ không rơi vào lỗi mơ hồ.

## Điểm Nổi Bật Hiện Tại

- `Asset workspace`: tìm kiếm theo mã tài sản, danh mục, vị trí, nhân viên đang giữ; lọc theo trạng thái, vị trí và assignment; thao tác nhanh xem chi tiết, bàn giao/thu hồi và mở workspace bảo trì.
- `Operational dashboard`: manager và technician có dashboard với giá trị tồn kho, thiết bị gián đoạn, hàng đợi duyệt, phân bổ theo bộ phận, xu hướng tài sản theo tháng và cảnh báo khấu hao.
- `Purchase order workspace`: form đơn hàng tách khối nhà cung cấp, danh sách sản phẩm và tổng hợp thanh toán để thao tác nhanh hơn.
- `Legacy compatibility`: endpoint cũ ngoài scope vẫn phản hồi `410 Gone` kèm message JSON rõ ràng.

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

Đăng nhập UI bằng `employee_code + password`. Email vẫn dùng cho profile và forgot-password.

## Chạy Với Docker

Từ thư mục gốc repo:

```bash
docker compose -f docker/docker-compose.yml up -d --build
docker compose -f docker/docker-compose.yml exec app php artisan migrate --seed
```

- `app` tự cài dependency, tạo `.env` nếu thiếu và chạy PHP built-in server tại `http://localhost:8000`.
- `vite` chạy HMR tại `http://localhost:5173`.
- `db` dùng MySQL 8.0 và publish cổng `3307` cho máy local.
- Trên Windows có thể dùng các helper script `scripts\docker-setup.bat`, `scripts\docker-start.bat`, `scripts\docker-stop.bat`.

Chạy kiểm tra:

```bash
npm run check:i18n
npm run build
php artisan test
```

## Tài Khoản Demo

Sau khi chạy `php artisan migrate --seed`, dùng các tài khoản mẫu sau để đăng nhập bằng `employee_code`:

| Role | Employee code | Email | Password | Mục đích |
| --- | --- | --- | --- | --- |
| manager | E1001 | `manager@mesoco.vn` | password | Quản lý báo cáo, user, duyệt phiếu |
| technician | E1002 | `technician@mesoco.vn` | password | Vận hành asset, maintenance, inventory |
| employee | E1003 | `employee@mesoco.vn` | password | Xem thiết bị được giao và gửi request |
| employee | E1004 | `frontdesk@mesoco.vn` | password | Nhân viên quầy lễ tân để test assignment |
| employee | E1005 | `warehouse@mesoco.vn` | password | Nhân viên kho để test assignment |

`Supplier` không được seed mặc định trong `DatabaseSeeder`; nếu cần test luồng supplier, tạo user supplier riêng trong hệ thống hoặc bằng factory/seeder bổ sung.

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
