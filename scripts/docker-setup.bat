@echo off
echo ========================================
echo  MESOCO DENTAL - DOCKER SETUP
echo ========================================
echo.
echo  Mode: Local development with Docker
echo  Prerequisites: Docker Desktop must be running
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
if %errorlevel% neq 0 (
    echo [ERROR] Docker build failed!
    pause
    exit /b 1
)

echo.
echo [3/5] Starting containers...
docker compose up -d
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start containers!
    pause
    exit /b 1
)

echo.
echo [4/5] Waiting for MySQL to be ready...
set RETRIES=0
:wait_db
set /a RETRIES+=1
if %RETRIES% gtr 30 (
    echo [ERROR] MySQL did not become ready after 30 attempts.
    pause
    exit /b 1
)
docker compose exec app php -r "try { new PDO('mysql:host=db;port=3306;dbname=mesoco_dental', 'mesoco', 'secret'); echo 'OK'; } catch(Exception \$e) { exit(1); }" >nul 2>&1
if %errorlevel% neq 0 (
    echo    Waiting for MySQL... attempt %RETRIES%/30
    timeout /t 3 /nobreak >nul
    goto wait_db
)
echo    MySQL is ready!

echo.
echo [5/5] Creating database + demo data...
docker compose exec app php artisan migrate:fresh --seed
if %errorlevel% neq 0 (
    echo [ERROR] Migration or seeding failed!
    echo Try running manually: docker compose exec app php artisan migrate:fresh --seed
    pause
    exit /b 1
)

echo.
echo ========================================
echo  SETUP COMPLETE!
echo ========================================
echo.
echo  Open browser:
echo     Frontend:  http://localhost:5173
echo     Backend:   http://localhost:8000
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
