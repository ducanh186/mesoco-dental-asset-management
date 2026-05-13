# Customer Docker Setup

File này dành cho máy khách chạy Windows. Khách chỉ cần copy-paste đúng từng khối lệnh trong PowerShell.

## 1. Mở đúng thư mục dự án

```powershell
cd C:\Users\HP\mesoco-dental-asset-management
```

Nếu dự án nằm ở ổ khác, đổi lại đúng đường dẫn thư mục dự án trên máy khách.

## 2. Chạy setup tự động

```powershell
.\scripts\docker-setup.bat
```

Script này sẽ tự build Docker image, bật container, cài Composer dependency trong container, tạo database và seed dữ liệu demo.

## 3. Nếu chỉ muốn bật lại app sau lần setup đầu tiên

```powershell
cd C:\Users\HP\mesoco-dental-asset-management
.\scripts\docker-start.bat
```

## 4. Nếu gặp lỗi vendor/autoload.php

Lỗi này nghĩa là PHP dependency trong Docker container chưa sẵn sàng. Chạy:

```powershell
cd C:\Users\HP\mesoco-dental-asset-management\docker
docker compose --env-file .env.runtime exec -T app composer install --no-interaction --prefer-dist --optimize-autoloader
docker compose --env-file .env.runtime exec -T app php artisan migrate:fresh --seed
```

## 5. Mở app

```powershell
start http://localhost:8000
```

Tài khoản demo:

| Role | Employee Code | Password |
| --- | --- | --- |
| Manager | E1001 | password |
| Technician | E1002 | password |
| Employee | E1003 | password |
| Frontdesk | E1004 | password |
| Warehouse | E1005 | password |

## 6. Reset sạch dữ liệu local

Chỉ dùng khi muốn xóa database local và tạo lại dữ liệu demo:

```powershell
cd C:\Users\HP\mesoco-dental-asset-management
.\scripts\docker-reset.bat
```
