@echo off
chcp 65001 >nul
echo ========================================
echo 🔄 Reset Docker (xóa dữ liệu + build lại)
echo ========================================
echo.
echo ⚠️  CẢNH BÁO: Sẽ xóa toàn bộ dữ liệu database!
echo.
set /p confirm="Bạn có chắc chắn? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo Đã hủy!
    exit /b
)

cd /d "%~dp0.."
cd docker

echo.
echo 🗑️  Xóa containers và volumes...
docker compose down -v

echo.
echo 🏗️  Build lại images...
docker compose build --no-cache

echo.
echo 🚀 Khởi động containers...
docker compose up -d

echo.
echo ⏳ Đợi MySQL khởi động (10 giây)...
timeout /t 10 /nobreak >nul

echo.
echo 🗃️  Chạy migrations + seeders...
docker compose exec app php artisan migrate:fresh --seed

echo.
echo ========================================
echo ✅ Hoàn tất reset!
echo ========================================
echo.
echo 📱 Frontend:  http://localhost:5173
echo 🔧 Backend:   http://localhost:8000
echo.
echo 👤 Demo accounts:
echo    - E0001 / password (Admin)
echo    - E0002 / password (Doctor)
echo    - E0003 / password (Technician)
echo ========================================
cd ..
