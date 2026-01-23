@echo off
chcp 65001 >nul
echo ========================================
echo 🐳 Khởi động Docker containers...
echo ========================================
echo.

cd /d "%~dp0.."
cd docker
docker compose up -d

echo.
echo ⏳ Đợi containers khởi động (5 giây)...
timeout /t 5 /nobreak >nul

echo.
echo 🧹 Xóa cache Laravel...
docker compose exec app php artisan config:clear

echo.
echo ========================================
echo ✅ Sẵn sàng!
echo ========================================
echo.
echo 📱 Frontend:  http://localhost:5173
echo 🔧 Backend:   http://localhost:8000
echo 💾 Database:  localhost:3307
echo.
echo 👤 Demo accounts:
echo    - E0001 / password (Admin)
echo    - E0002 / password (Doctor)
echo    - E0003 / password (Technician)
echo.
echo 🛑 Để tắt: scripts\docker-stop.bat
echo ========================================
cd ..
