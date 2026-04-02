# Mesoco Dental Asset Management

> Hệ thống quản lý tài sản nha khoa - Laravel 12 + React 19 + Docker

---

## 🚀 Bắt Đầu Ngay

### Cách Nhanh Nhất (Khuyến Nghị)

1. Cài [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Double-click: `scripts\docker-setup.bat`
3. Đợi 2-3 phút
4. Mở `http://localhost:8000`
5. Đăng nhập và Test.

✅ **XONG!**

---

## 📚 Tài Liệu

Sau khi seed dữ liệu demo, xem chi tiết dataset tại [docs/SEED_DATA.md](docs/SEED_DATA.md).

| File | Nội dung |
|------|----------|
| [🗃️ SEED_DATA.md](docs/SEED_DATA.md) | Tài khoản demo, assets mẫu, cách seed dữ liệu |
| [🛠️ STACK.md](docs/STACK.md) | Tech stack chi tiết |
| [👥 ROLE_FEATURES.md](docs/ROLE_FEATURES.md) | Chi tiết tính năng theo role |
| [🔐 RBAC_MATRIX.md](docs/RBAC_MATRIX.md) | Ma trận quyền theo API/role |
| [🧱 DB_CONVENTIONS.md](docs/DB_CONVENTIONS.md) | Quy ước database và quan hệ bảng |

---


## 👥 Tài Khoản Demo

> **Thông tin đầy đủ trong Database sau khi chạy seeder**

### 📋 Danh Sách Test Accounts

| Vai trò | Mã Nhân Viên | Email | Mật Khẩu | Quyền | Mô tả |
|---------|--------------|-------|----------|-------|-------|
| **Quản trị viên-Admin** | `E0001` | `admin@mesoco.vn` | `password` | `admin` | Toàn quyền hệ thống |
| **Nhân sự-HR** | `E0002` | `hr@mesoco.vn` | `password` | `hr` | Quản lý tài sản + nhân viên |
| **Bác sĩ-Doctor** | `E0003` | `doctor@mesoco.vn` | `password` | `doctor` | Tài sản cá nhân + Yêu cầu thiết bị |
| **Kỹ thuật viên-Technican** | `E0004` | `tech@mesoco.vn` | `password` | `technician` | Tài sản cá nhân + Bảo trì |
| **Nhân viên-Staff** | `E0005` | `staff@mesoco.vn` | `password` | `employee` | Chỉ xem tài sản cá nhân |

### 🎯 Tính Năng Theo Role

**👑 Quản trị viên-Admin (`E0001`)** → [Chi tiết](docs/ROLE_FEATURES.md#admin-features)
- ✅ Toàn quyền hệ thống
- ✅ Quản lý tài sản (Thêm/sửa/xóa, Phân công/Thu hồi)
- ✅ Quản lý Nhân viên-Staff (Thêm/sửa/xóa, Phân quyền)
- ✅ Quản lý tài khoản (Tạo TK, Reset mật khẩu)
- ✅ Duyệt yêu cầu & Phê duyệt
- ✅ Báo cáo & thống kê hệ thống

**👔 Nhân sự-HR (`E0002`)** → [Chi tiết](docs/ROLE_FEATURES.md#hr-features)
- ✅ Quản lý tài sản (Thêm/sửa/xóa, Phân công/Thu hồi)
- ✅ Quản lý Nhân viên-Staff (Thêm/sửa/xóa)
- ✅ Duyệt yêu cầu & Phê duyệt
- ✅ Báo cáo phân công tài sản
- ❌ Thay đổi quyền người dùng (Chỉ Admin)

**🩺 Bác sĩ-Doctor (`E0003`)** → [Chi tiết](docs/ROLE_FEATURES.md#doctor-features)
- ✅ Tài sản của tôi (Xem, Quét QR)
- ✅ Yêu cầu thiết bị (Báo cáo sự cố tài sản được giao)
- ✅ Yêu cầu mượn tài sản (Mượn thiết bị có sẵn)
- ✅ Lịch sử yêu cầu & theo dõi trạng thái
- ❌ Quản lý tài sản, Quản lý Nhân viên-Staff

**🔧 Kỹ thuật viên-Technican (`E0004`)** → [Chi tiết](docs/ROLE_FEATURES.md#technician-features)
- ✅ Tài sản của tôi (Xem, Quét QR)
- ✅ Yêu cầu bảo trì (Báo cáo sự cố thiết bị)
- ✅ Check-in/Check-out tài sản (Cho tài sản được giao)
- ✅ Yêu cầu vật tư tiêu hao
- ❌ Phân công tài sản, Quản lý Nhân viên-Staff

**👤 Nhân viên-Staff (`E0005`)** → [Chi tiết](docs/ROLE_FEATURES.md#staff-features)
- ✅ Tài sản của tôi (Chỉ xem, Quét QR)
- ✅ Yêu cầu thiết bị cơ bản
- ✅ Quản lý hồ sơ cá nhân
- ❌ Quản lý tài sản, Yêu cầu phức tạp

> **Chi tiết đầy đủ:** Xem [docs/ROLE_FEATURES.md](docs/ROLE_FEATURES.md)

### 🔑 Cách Đăng Nhập

**Bằng Mã Nhân viên-Staff:**
- Mã NV: `E0001` (Quản trị viên -Admin) / `E0002` (Nhân sự-HR) / `E0003` (Bác sĩ-Doctor) / `E0004` (Kỹ thuật) / `E0005` (Nhân viên-Staff)
- Mật khẩu: `password`

**Bằng Email (Quên mật khẩu):**
- Email: `admin@mesoco.vn`, `hr@mesoco.vn`, `doctor@mesoco.vn`, `tech@mesoco.vn`, `staff@mesoco.vn`
- Dùng cho tính năng khôi phục mật khẩu

### 🔐 Database Details

**Bảng:** `users`

| Field | Type | Mô tả |
|-------|------|-------|
| `id` | bigint | Auto increment |
| `full_name` | string | Tên nhân viên |
| `email` | string | Email (unique) |
| `employee_code` | string | Mã NV (unique) - Dùng để login |
| `password` | string | Bcrypt hash của `password` |
| `role` | enum | `admin`, `hr`, `doctor`, `technician`, `employee` |
| `status` | enum | `active`, `inactive` (default: `active`) |
| `must_change_password` | boolean | Force change pass (default: `true`) |

**Password Hash Example:**
```
Plain: password
Hash: $2y$12$abcd...xyz (bcrypt, 60 chars)
```

### 🧪 Cách Sử Dụng Tài Khoản Test

**Trang Đăng Nhập:** Dùng `mã_nhân_viên` + `mật_khẩu`
```
Quản trị viên-Admin: E0001 / password
Nhân sự-HR: E0002 / password  
Bác sĩ-Doctor: E0003 / password
Kỹ thuật viên-Technican: E0004 / password
Nhân viên: E0005 / password
```

**Quên Mật Khẩu:** Dùng `email`
```
admin@mesoco.vn / hr@mesoco.vn / doctor@mesoco.vn / technician@mesoco.vn / staff@mesoco.vn
→ Nhận mã 6 số trong storage/logs/laravel.log
→ Đặt lại mật khẩu
```
---

## 🌐 Dịch Vụ

| Dịch vụ | URL | Mục đích |
|---------|-----|-----------|
| **Backend** | http://localhost:8000 | Laravel API + Ứng dụng chính |
| **Frontend** | http://localhost:5173 | Vite dev (Tải nóng) |
| **Cơ sở dữ liệu** | localhost:3307 | MySQL |

**Lưu ý:** Dùng port 8000 để test, không phải 5173!

---

## 🎨 Phạm Vi Chỉnh Sửa

**✅ An toàn:**
- `resources/js/**` - React components
- `resources/css/**` - Styles
- `resources/views/**` - Blade templates

**⚠️ Cẩn thận:**
- `app/**` - Laravel backend
- `database/**` - Migrations/Seeders
- `routes/**` - API routes
- `config/**` - Configuration

**❌ Không động:**
- `vendor/**` - PHP dependencies
- `node_modules/**` - Node dependencies
- `docker/**` - Docker config

---

## 🔄 Cập Nhật Code Mới Nhất

### Lần đầu clone về
```powershell
git clone https://github.com/ducanh186/mesoco-dental-asset-management.git
cd mesoco-dental-asset-management
```

### Cập nhật code từ remote
```powershell
# Nếu có file untracked bị conflict, xóa trước:
# del database\migrations\<tên_file_bị_lỗi>.php

git pull origin main
```

### Sau khi pull — chạy migration + seed lại
```powershell
# Nếu dùng Docker:
cd docker
docker compose exec app php artisan migrate:fresh --seed

# Nếu chạy local (không Docker):
php artisan migrate:fresh --seed
```

> **Lưu ý:** `migrate:fresh` xóa toàn bộ dữ liệu cũ và tạo lại từ đầu.  
> Chỉ dùng khi muốn reset DB về trạng thái demo ban đầu.

---

## 🆘 Gặp Lỗi?

### ❌ "Cannot connect to the Docker daemon"
**Nguyên nhân:** Docker Desktop chưa chạy

**Fix:** Mở Docker Desktop → Đợi icon chuyển xanh → Thử lại

---

### ❌ "port is already allocated"
**Nguyên nhân:** Port 8000/5173/3307 đã bị chiếm

**Fix:**
```powershell
cd docker
docker compose down
# Kill process đang dùng port (Task Manager)
docker compose up -d
```

---

### ❌ "SQLSTATE[HY000] [2002] Connection refused"
**Nguyên nhân:** MySQL chưa khởi động xong

**Fix:**
```powershell
cd docker
docker compose restart app
timeout /t 10
# Thử lại http://localhost:8000
```

---

### ❌ "SQLSTATE[HY000] [1045] Access denied"
**Nguyên nhân:** Password MySQL sai

**Fix:**
```powershell
cd docker
docker compose exec app sed -i 's/DB_HOST=.*/DB_HOST=db/' .env
docker compose exec app sed -i 's/DB_PASSWORD=.*/DB_PASSWORD=root/' .env
docker compose exec app php artisan config:clear
docker compose restart app
```

---

### ❌ Lỗi khác
**Reset toàn bộ:**
```
scripts\docker-reset.bat
```

**Thu thập log:**
```powershell
cd docker
docker compose logs app --tail=100 > error.txt
# Gửi file error.txt khi cần hỗ trợ
```

---

## 📚 Tài Liệu Chi Tiết

| File | Nội dung |
|------|----------|
| [🗃️ SEED_DATA.md](docs/SEED_DATA.md) | Mô tả đầy đủ dữ liệu demo và cách seed |
| [🛠️ STACK.md](docs/STACK.md) | Tech stack chi tiết |
| [👥 ROLE_FEATURES.md](docs/ROLE_FEATURES.md) | Chi tiết tính năng theo role |
| [🔐 RBAC_MATRIX.md](docs/RBAC_MATRIX.md) | Ma trận quyền |
| [🧱 DB_CONVENTIONS.md](docs/DB_CONVENTIONS.md) | Quy ước DB |

---

## 📦 Tech Stack

- **Backend:** Laravel 12.48.1, PHP 8.4
- **Frontend:** React 19, Vite 6, TailwindCSS 4
- **Database:** MySQL 8.0
- **Auth:** Laravel Sanctum (SPA)
- **Docker:** docker-compose (dev environment)

---
