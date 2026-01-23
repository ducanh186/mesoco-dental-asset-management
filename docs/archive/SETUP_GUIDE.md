# 📘 HƯỚNG DẪN SETUP & TROUBLESHOOTING

> Tài liệu đầy đủ cho người mới - Từ cài đặt đến xử lý lỗi

---

## 🚀 SETUP NHANH (Khuyến Nghị)

### Yêu cầu
- **Docker Desktop** ([Tải tại đây](https://www.docker.com/products/docker-desktop/))
- Windows 10/11 / Mac / Linux

### Bước 1: Mở Docker Desktop
Đợi icon Docker ở system tray chuyển màu xanh (đã sẵn sàng)

### Bước 2: Chạy Script Setup
```
Double-click: scripts\docker-setup.bat
```

### Bước 3: Đợi 2-3 Phút
Script tự động:
- ✅ Kiểm tra Docker
- ✅ Build images
- ✅ Khởi động containers
- ✅ Tạo database + dữ liệu demo

### Bước 4: Test
Mở trình duyệt: `http://localhost:8000`

**Đăng nhập:**
- Mã nhân viên: `E0001`
- Mật khẩu: `password`

✅ **Thấy Dashboard → THÀNH CÔNG!**

---

## ✅ CHECKLIST CHO NGƯỜI MỚI / MÁY MỚI

## Chuẩn Bị Ban Đầu

- [ ] Cài Docker Desktop ([Tải tại đây](https://www.docker.com/products/docker-desktop/))
- [ ] Khởi động Docker Desktop (nhìn thấy biểu tượng Docker ở system tray)
- [ ] Tải project về máy (clone từ Git hoặc copy folder)

---

## Setup Lần Đầu (Chỉ Làm 1 Lần)

### Cách Nhanh: Dùng Script

- [ ] Mở thư mục project `mesoco-dental-asset-management`
- [ ] Double-click file `scripts\docker-setup.bat`
- [ ] Đợi 2-3 phút
- [ ] Thấy thông báo "SETUP HOÀN TẤT!" → Sang bước Test

### Cách Thủ Công (Backup)

Nếu script không chạy, làm theo:

1. [ ] Mở Command Prompt/PowerShell
2. [ ] Chạy: `cd docker`
3. [ ] Chạy: `docker compose build`
4. [ ] Chạy: `docker compose up -d`
5. [ ] Đợi 15 giây
6. [ ] Chạy: `docker compose exec app php artisan migrate:fresh --seed`

---

## Test Hệ Thống

- [ ] Mở trình duyệt
- [ ] Vào: `http://localhost:8000`
- [ ] Nhập: `E0001` + `password`
- [ ] Nhấn "Đăng nhập"
- [ ] Thấy màn hình Dashboard → ✅ **THÀNH CÔNG!**

---

## Các Lỗi Thường Gặp & Cách Fix

### ❌ "Cannot connect to the Docker daemon"

**Nguyên nhân:** Docker Desktop chưa chạy

**Fix:**
1. Mở Docker Desktop
2. Đợi icon Docker ở system tray chuyển sang màu xanh
3. Thử lại

---

### ❌ "port is already allocated"

**Nguyên nhân:** Port 8000/5173/3307 đã bị chiếm

**Fix:**
```powershell
cd docker
docker compose down
netstat -ano | findstr "8000"
# Xem PID (cột cuối), kill process bằng Task Manager
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

**Nguyên nhân:** Cấu hình `.env` trong container sai

**Fix (đã sửa trong docker-setup.bat, nhưng nếu vẫn lỗi):**
```powershell
cd docker
docker compose exec app sed -i 's/DB_HOST=.*/DB_HOST=db/' .env
docker compose exec app sed -i 's/DB_PASSWORD=.*/DB_PASSWORD=root/' .env
docker compose exec app php artisan config:clear
docker compose restart app
```

---

### ❌ Lỗi khác / Không biết fix

**Cách 1: Reset toàn bộ**
```
Double-click: scripts\docker-reset.bat
```

**Cách 2: Thu thập log gửi người hỗ trợ**
```powershell
cd docker
docker compose ps > debug.txt
docker compose logs app --tail=100 >> debug.txt
docker compose logs db --tail=50 >> debug.txt
# Gửi file debug.txt
```

---

## Làm Việc Hàng Ngày

### Sáng Bắt Đầu Làm
```
Double-click: scripts\docker-start.bat
```

### Tối Về Nhà (hoặc nghỉ trưa lâu)
```
Double-click: scripts\docker-stop.bat
```

---

## 📋 SETUP THỦ CÔNG (Không Dùng Docker)

### 1. Yêu Cầu
- PHP 8.4+
- MySQL 8.0+
- Node.js 20+
- Composer

### 2. Cài Đặt Dependencies
```bash
# Backend (PHP)
composer install

# Frontend (Node.js)
npm install
```

### 3. Cấu Hình Database
Copy file `.env`:
```bash
copy .env.example .env
```

Chỉnh sửa `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mesoco_dental
DB_USERNAME=root
DB_PASSWORD=your_password
```

Tạo database:
```sql
CREATE DATABASE mesoco_dental;
```

### 4. Khởi Tạo
```bash
# Generate key
php artisan key:generate

# Run migrations + seeds
php artisan migrate --seed
```

### 5. Chạy Dev Server
```bash
# Terminal 1: Vite HMR
npm run dev

# Terminal 2: Laravel
php artisan serve
```

Mở: `http://localhost:8000`

---

## Làm Việc Hàng Ngày

---

## Tài Khoản Demo

| Vai trò | Mã NV | Mật khẩu | Ghi chú |
|---------|-------|----------|---------|
| Quản trị | E0001 | password | Full quyền |
| Bác sĩ | E0002 | password | Xem + tạo yêu cầu |
| Kỹ thuật viên | E0003 | password | Quản lý bảo trì |

---

## Địa Chỉ Services

| Service | URL | Mục đích |
|---------|-----|----------|
| **Frontend** | http://localhost:5173 | Vite dev server (HMR) |
| **Backend** | http://localhost:8000 | Laravel API + SPA |
| **Database** | localhost:3307 | MySQL (dùng GUI tools) |

**Lưu ý:** Dùng http://localhost:8000 để test, không dùng 5173 khi test login!

---

## File Quan Trọng - KHÔNG XÓA

```
scripts/
  ├── docker-setup.bat   ← Setup lần đầu
  ├── docker-start.bat   ← Khởi động hàng ngày
  ├── docker-stop.bat    ← Dừng containers
  └── docker-reset.bat   ← Reset khi lỗi
docker/
  ├── docker-compose.yml
  ├── .env.docker        ← Cấu hình database đúng
  └── app/
      ├── Dockerfile
      └── entrypoint.sh
```

---

## Liên Hệ Hỗ Trợ

Khi cần escalate:
1. Chụp ảnh lỗi
2. Chạy `cd docker && docker compose logs app --tail=50 > error.txt`
3. Gửi kèm file `error.txt`
4. Mô tả bước đã làm trước khi lỗi

---

**Cập nhật:** Phase 0.5 Devpack (Jan 23, 2026)
