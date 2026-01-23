@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 SETUP BAN ĐẦU - MESOCO DENTAL
echo ========================================
echo.
echo Hướng dẫn cho người mới / máy mới:
echo 1. Cài Docker Desktop (phải đang chạy)
echo 2. Chạy file này
echo 3. Đợi 2-3 phút
echo 4. Xong!
echo ========================================
echo.

REM Kiểm tra Docker có chạy không
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ LỖI: Docker Desktop chưa chạy!
    echo.
    echo 📝 Hướng dẫn:
    echo    1. Mở Docker Desktop
    echo    2. Đợi Docker khởi động xong
    echo    3. Chạy lại file này
    echo.
    pause
    exit /b 1
)

echo ✅ Docker đã sẵn sàng!
echo.

cd /d "%~dp0.."
cd docker

echo [1/5] 🗑️  Dọn dẹp containers cũ (nếu có)...
docker compose down -v 2>nul

echo.
echo [2/5] 🏗️  Build Docker images...
echo (Lần đầu sẽ mất 2-3 phút, lần sau nhanh hơn)
docker compose build

echo.
echo [3/5] 🚀 Khởi động containers...
docker compose up -d

echo.
echo [4/5] ⏳ Đợi MySQL khởi động hoàn toàn (15 giây)...
timeout /t 15 /nobreak >nul

echo.
echo [5/5] 🗃️  Tạo database + dữ liệu demo...
docker compose exec app php artisan migrate:fresh --seed

echo.
echo ========================================
echo ✅ SETUP HOÀN TẤT!
echo ========================================
echo.
echo 🌐 Mở trình duyệt và truy cập:
echo    👉 http://localhost:8000
echo.
echo 👤 Đăng nhập với tài khoản demo:
echo    Employee Code: E0001
echo    Password:      password
echo.
echo 📌 Tài khoản khác:
echo    - E0002 / password (Bác sĩ)
echo    - E0003 / password (Kỹ thuật viên)
echo.
echo ========================================
echo 🔧 Các lệnh hữu ích:
echo ========================================
echo    scripts\docker-start.bat  - Khởi động nhanh
echo    scripts\docker-stop.bat   - Dừng containers
echo    scripts\docker-reset.bat  - Reset toàn bộ
echo ========================================
echo.

cd ..
pause
