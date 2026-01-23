# Mesoco Dental Asset Management

> Hệ thống quản lý tài sản nha khoa - Laravel 12 + React 19 + Docker

---

## 🚀 Bắt Đầu Ngay

### Cách Nhanh Nhất (Khuyến Nghị)

1. Cài [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Double-click: `scripts\docker-setup.bat`
3. Đợi 2-3 phút
4. Mở `http://localhost:8000`
5. Đăng nhập: `E0001` / `password`

✅ **XONG!**

---

## 📚 Tài Liệu

Xem tất cả: [docs/INDEX.md](docs/INDEX.md)

| File | Nội dung |
|------|----------|
| [📁 PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) | Cấu trúc project & workflow |
| [📋 DECISIONS.md](docs/DECISIONS.md) | Kiến trúc & quyết định kỹ thuật |
| [🛠️ STACK.md](docs/STACK.md) | Tech stack chi tiết |
| [🎯 VIBE_CODE_PLAYBOOK.md](docs/VIBE_CODE_PLAYBOOK.md) | Quy tắc phát triển |

---

## 🔧 Lệnh Hàng Ngày

| Script | Khi nào dùng |
|--------|--------------|
| `scripts\docker-start.bat` | Sáng bắt đầu làm |
| `scripts\docker-stop.bat` | Tối về nhà |
| `scripts\docker-reset.bat` | Gặp lỗi cần reset |

---

## 👥 Tài Khoản Demo

> **Thông tin đầy đủ trong Database sau khi chạy seeder**

### 📋 Danh Sách Test Accounts

| Vai trò | Mã Nhân Viên | Email | Mật Khẩu | Role |
|---------|--------------|-------|----------|------|
| **Admin** | `E0001` | `admin@mesoco.vn` | `password` | `admin` |
| **Bác sĩ** | `E0002` | `doctor@mesoco.vn` | `password` | `doctor` |
| **Kỹ thuật viên** | `E0003` | `tech@mesoco.vn` | `password` | `technician` |

### 🔑 Cách Đăng Nhập

**Bằng Employee ID:**
- Employee ID: `E0001`
- Password: `password`

**Bằng Email (Forgot Password):**
- Email: `admin@mesoco.vn`
- Dùng cho tính năng reset password

### 🔐 Database Details

**Bảng:** `users`

| Field | Type | Mô tả |
|-------|------|-------|
| `id` | bigint | Auto increment |
| `name` | string | Tên nhân viên |
| `email` | string | Email (unique) |
| `employee_code` | string | Mã NV (unique) - Dùng để login |
| `password` | string | Bcrypt hash của `password` |
| `role` | enum | `admin`, `doctor`, `technician` |
| `status` | enum | `active`, `inactive` (default: `active`) |

**Password Hash Example:**
```
Plain: password
Hash: $2y$12$abcd...xyz (bcrypt, 60 chars)
```

### 🧪 Test Accounts Usage

**Login Page:** Dùng `employee_code` + `password`
```
E0001 / password
```

**Forgot Password:** Dùng `email`
```
admin@mesoco.vn
→ Nhận mã 6 số trong storage/logs/laravel.log
→ Reset password
```

**API Testing:**
```bash
# Login
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"employee_code":"E0001","password":"password"}'

# Get user info
curl http://localhost:8000/api/me \
  -H "Authorization: Bearer {token}"
```

---

## 🌐 Services

| Service | URL | Mục đích |
|---------|-----|----------|
| **Backend** | http://localhost:8000 | Laravel API + SPA |
| **Frontend** | http://localhost:5173 | Vite dev (HMR) |
| **Database** | localhost:3307 | MySQL |

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
| [📁 PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) | Cấu trúc project & workflow |
| [📋 DECISIONS.md](docs/DECISIONS.md) | Kiến trúc & quyết định kỹ thuật |
| [🛠️ STACK.md](docs/STACK.md) | Tech stack chi tiết |
| [🎯 VIBE_CODE_PLAYBOOK.md](docs/VIBE_CODE_PLAYBOOK.md) | Quy tắc phát triển |

---

## 📦 Tech Stack

- **Backend:** Laravel 12.48.1, PHP 8.4
- **Frontend:** React 19, Vite 6, TailwindCSS 4
- **Database:** MySQL 8.0
- **Auth:** Laravel Sanctum (SPA)
- **Docker:** docker-compose (dev environment)

---

## 🏗️ Phase Hiện Tại

**Phase 0.5 - Devpack Complete** ✅
- [x] Docker containerization
- [x] Auto-setup scripts
- [x] Authentication (Sanctum SPA)
- [x] Demo accounts
- [x] Basic UI shell

**Phase 1 - MVP (Coming Next)**
- [ ] Asset management (CRUD)
- [ ] QR code generation
- [ ] Maintenance tracking
- [ ] Request system

---

**Cập nhật:** Jan 23, 2026 - Phase 0.5 Devpack