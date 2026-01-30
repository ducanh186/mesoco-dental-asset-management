@echo off
chcp 65001 >nul
echo ========================================
echo  MESOCO DENTAL - DOCKER SETUP
echo ========================================
echo.
echo  Mode: Local development with Docker
echo  No ngrok required - runs on localhost
echo.
echo  Prerequisites:
echo  1. Docker Desktop must be running
echo  2. Run this script
echo  3. Wait 2-3 minutes
echo  4. Done!
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Desktop is not running!
    echo.
    echo Please:
    echo    1. Open Docker Desktop
    echo    2. Wait for Docker to start
    echo    3. Run this script again
    echo.
    pause
    exit /b 1
)

echo [OK] Docker is ready!
echo.

cd /d "%~dp0.."
cd docker

echo [1/5] Cleaning up old containers (if any)...
docker compose down -v 2>nul

echo.
echo [2/5] Building Docker images...
echo (First time takes 2-3 minutes, subsequent runs are faster)
docker compose build

echo.
echo [3/5] Starting containers...
docker compose up -d

echo.
echo [4/5] Waiting for MySQL to be ready (15 seconds)...
timeout /t 15 /nobreak >nul

echo.
echo [5/5] Creating database + demo data...
docker compose exec app php artisan migrate:fresh --seed

echo.
echo ========================================
echo  SETUP COMPLETE!
echo ========================================
echo.
echo  Open browser and go to:
echo     http://localhost:8000
echo.
echo  Test Accounts:
echo  +-----------+---------------+----------+
echo  ^| Role      ^| Employee Code ^| Password ^|
echo  +-----------+---------------+----------+
echo  ^| Admin     ^| E0001         ^| password ^|
echo  ^| HR        ^| E0002         ^| password ^|
echo  ^| Doctor    ^| E0003         ^| password ^|
echo  ^| Technician^| E0004         ^| password ^|
echo  ^| Staff     ^| E0005         ^| password ^|
echo  +-----------+---------------+----------+
echo.
echo  Useful commands:
echo     scripts\docker-start.bat  - Quick start
echo     scripts\docker-stop.bat   - Stop containers
echo     scripts\docker-reset.bat  - Reset everything
echo ========================================
echo.

cd ..
pause
