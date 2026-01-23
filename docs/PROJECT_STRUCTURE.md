# 📁 Cấu Trúc Project - Mesoco Dental

## Root Files
```
mesoco-dental-asset-management/
├── README.md                    ← Hướng dẫn tổng quan (BẮT ĐẦU TỪ ĐÂY)
├── composer.json                ← PHP dependencies
├── package.json                 ← Node.js dependencies
├── .env.example                 ← Config mẫu
├── vite.config.js               ← Vite build config
└── artisan                      ← Laravel CLI
```

## Folders Chính

### 📂 scripts/
**Scripts tiện ích - Chạy từ thư mục gốc project**

```
scripts/
├── docker-setup.bat     ← Setup lần đầu (người mới/máy mới)
├── docker-start.bat     ← Khởi động hàng ngày
├── docker-stop.bat      ← Dừng containers
├── docker-reset.bat     ← Reset toàn bộ khi lỗi
└── demo.bat             ← Demo không dùng Docker
```

**Cách dùng:**
```cmd
# Từ thư mục gốc
scripts\docker-start.bat

# Hoặc double-click file trong Windows Explorer
```

---

### 📂 docker/
**Docker configuration**

```
docker/
├── docker-compose.yml   ← Định nghĩa 3 services (app, db, vite)
├── .env.docker          ← Config cho Docker (DB_HOST=db)
├── .env.local           ← Config local (DB_HOST=127.0.0.1)
└── app/
    ├── Dockerfile       ← PHP 8.4 + Node 20 image
    └── entrypoint.sh    ← Auto-install dependencies on start
```

**Services:**
- `app` - Laravel backend (port 8000)
- `db` - MySQL 8.0 (port 3307 external, 3306 internal)
- `vite` - Vite HMR dev server (port 5173)

---

### 📂 docs/
**Tài liệu dự án**

```
docs/
├── INDEX.md                 ← Mục lục tổng hợp tất cả docs
├── PROJECT_STRUCTURE.md     ← File này (cấu trúc project)
├── DECISIONS.md             ← Kiến trúc & quyết định kỹ thuật
├── STACK.md                 ← Tech stack chi tiết
├── VIBE_CODE_PLAYBOOK.md    ← Quy tắc phát triển cho AI agents
└── archive/                 ← Old docs (vision, UI map, etc.)
```

**Đọc thứ tự:**
1. `README.md` (root) - Quickstart + Troubleshooting
2. `PROJECT_STRUCTURE.md` - Cấu trúc & workflow
3. `STACK.md` - Hiểu tech stack
4. `DECISIONS.md` - Tại sao chọn tech này

---

### 📂 app/
**Laravel Backend (PHP)**

```
app/
├── Http/
│   ├── Controllers/         ← API controllers
│   └── Middleware/
│       └── Authenticate.php ← Handle unauthenticated requests
├── Models/
│   └── User.php             ← User model (Sanctum auth)
└── Providers/
    └── AppServiceProvider.php
```

**⚠️ Cẩn thận khi chỉnh sửa!**

---

### 📂 resources/
**Frontend Assets (React + CSS)**

```
resources/
├── js/
│   ├── app.jsx              ← Main React entry point
│   ├── bootstrap.js         ← Axios + CSRF setup
│   ├── components/          ← Reusable React components
│   │   ├── DashboardCard.jsx
│   │   ├── Logo.jsx
│   │   └── ...
│   ├── layouts/
│   │   └── MainLayout.jsx   ← Sidebar + Topbar layout
│   └── pages/
│       ├── LoginPage.jsx    ← BlueOC branded login
│       └── DashboardPage.jsx
├── css/
│   └── app.css              ← TailwindCSS 4
└── views/
    └── spa.blade.php        ← SPA shell
```

**✅ An toàn để chỉnh sửa**

---

### 📂 routes/
**Route Definitions**

```
routes/
├── web.php                  ← Web routes (Sanctum auth + SPA catch-all)
├── api.php                  ← API routes
└── console.php              ← Artisan commands
```

**Key routes in web.php:**
- `POST /login` - Sanctum login
- `POST /logout` - Sanctum logout
- `GET /api/me` - Current user
- `GET /{any}` - SPA catch-all

---

### 📂 database/
**Database Schema & Seeds**

```
database/
├── migrations/
│   ├── 0001_01_01_000000_create_users_table.php
│   ├── 2026_01_23_100503_create_personal_access_tokens_table.php
│   ├── 2026_01_23_100536_add_columns_to_users_table.php
│   └── ...
├── seeders/
│   └── DatabaseSeeder.php  ← Demo users (E0001, E0002, E0003)
└── factories/
    └── UserFactory.php
```

**Demo users:**
- E0001 / password (Admin)
- E0002 / password (Doctor)
- E0003 / password (Technician)

---

### 📂 config/
**Laravel Configuration**

```
config/
├── app.php                  ← App name, locale (vi), timezone
├── auth.php                 ← Auth guards
├── database.php             ← Database connections
├── sanctum.php              ← Sanctum stateful domains
└── ...
```

**Key configs:**
- `APP_LOCALE=vi` - Vietnamese
- `SESSION_DRIVER=database` - For Sanctum SPA
- Stateful domains: localhost, 127.0.0.1, ports 8000/5173

---

### 📂 public/
**Web Root (Build Output)**

```
public/
├── index.php                ← Laravel entry point
├── build/                   ← Vite build output (generated)
│   ├── manifest.json
│   └── assets/
└── robots.txt
```

**⚠️ Không edit thủ công! Build tự động tạo**

---

### 📂 storage/
**Writable Storage**

```
storage/
├── app/                     ← User uploads
├── framework/               ← Laravel cache/sessions
│   ├── cache/
│   ├── sessions/
│   └── views/
└── logs/
    └── laravel.log          ← Debug logs
```

**Xem logs khi debug:**
```bash
tail -f storage/logs/laravel.log
```

---

### 📂 tests/
**Automated Tests**

```
tests/
├── TestCase.php
├── Feature/
│   └── ExampleTest.php
└── Unit/
    └── ExampleTest.php
```

**Chạy tests:**
```bash
php artisan test
```

---

## Workflow Thông Thường

### Người Mới Setup Lần Đầu
```
1. Clone project
2. Double-click: scripts\docker-setup.bat
3. Đợi 2-3 phút
4. Mở http://localhost:8000
```

### Dev Hàng Ngày
```
# Sáng
scripts\docker-start.bat

# Code...
# Edit files in resources/js/**
# Browser auto-refresh (Vite HMR)

# Tối
scripts\docker-stop.bat
```

### Gặp Lỗi Lạ
```
scripts\docker-reset.bat
(Xóa toàn bộ + build lại)
```

---

## Files KHÔNG Commit Git

```
.env                         ← Config cá nhân
vendor/                      ← PHP dependencies
node_modules/                ← Node dependencies
storage/logs/*.log           ← Log files
public/build/                ← Build output
```

**Đã có trong `.gitignore`**

---

## Khi Cần Sửa Code

### Frontend (React)
```
resources/js/pages/LoginPage.jsx    ← Sửa UI login
resources/js/layouts/MainLayout.jsx ← Sửa sidebar/topbar
resources/css/app.css               ← Sửa styles
```

Browser tự động reload (Vite HMR)

### Backend (Laravel)
```
app/Http/Controllers/Auth/AuthController.php  ← Sửa login logic
routes/web.php                                 ← Thêm routes
database/migrations/                           ← Thêm bảng mới
```

Cần restart Laravel:
```bash
docker compose restart app
```

---

## Quick Reference

| Nhiệm vụ | Lệnh |
|----------|------|
| Setup lần đầu | `scripts\docker-setup.bat` |
| Khởi động | `scripts\docker-start.bat` |
| Dừng | `scripts\docker-stop.bat` |
| Reset | `scripts\docker-reset.bat` |
| Xem logs | `docker compose logs app -f` |
| Vào container | `docker compose exec app sh` |
| Chạy migration | `docker compose exec app php artisan migrate` |
| Clear cache | `docker compose exec app php artisan cache:clear` |

---

**Cập nhật:** Phase 0.5 Devpack (Jan 23, 2026)
