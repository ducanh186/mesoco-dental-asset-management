@echo off
chcp 65001 >nul
echo ========================================
echo 🛑 Dừng Docker containers...
echo ========================================
echo.

cd /d "%~dp0.."
cd docker
docker compose down

echo.
echo ✅ Đã dừng tất cả containers!
echo.
echo 🚀 Để khởi động lại: scripts\docker-start.bat
echo ========================================
cd ..
