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

echo Detecting LAN IP for QR links...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0write-runtime-env.ps1"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create Docker runtime environment.
    pause
    exit /b 1
)
set "COMPOSE_CMD=docker compose --env-file .env.runtime"

echo [1/5] Cleaning up old containers (if any)...
%COMPOSE_CMD% down -v 2>nul

echo.
echo [2/5] Building Docker images...
echo (First time takes 2-3 minutes, subsequent runs are faster)
%COMPOSE_CMD% build
if %errorlevel% neq 0 (
    echo [ERROR] Docker build failed!
    pause
    exit /b 1
)

echo.
echo [3/5] Starting containers...
%COMPOSE_CMD% up -d
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start containers!
    pause
    exit /b 1
)

echo.
echo [4/6] Ensuring PHP dependencies are installed...
set DEP_RETRIES=0
:wait_vendor
set /a DEP_RETRIES+=1
%COMPOSE_CMD% exec -T app test -f vendor/autoload.php >nul 2>&1
if %errorlevel% neq 0 (
    if %DEP_RETRIES% gtr 80 goto install_vendor
    echo    Waiting for Composer dependencies... attempt %DEP_RETRIES%/80
    timeout /t 3 /nobreak >nul
    goto wait_vendor
)
goto vendor_ready

:install_vendor
echo    vendor/autoload.php is still missing; running composer install manually...
%COMPOSE_CMD% exec -T app composer install --no-interaction --prefer-dist --optimize-autoloader
if %errorlevel% neq 0 (
    echo [ERROR] PHP dependencies are missing inside the Docker app container.
    echo Recent app logs:
    %COMPOSE_CMD% logs --tail=80 app
    echo Try running manually:
    echo cd /d "%cd%"
    echo docker compose --env-file .env.runtime exec -T app composer install --no-interaction --prefer-dist --optimize-autoloader
    pause
    exit /b 1
)
%COMPOSE_CMD% exec -T app test -f vendor/autoload.php
if %errorlevel% neq 0 (
    echo [ERROR] composer install finished but vendor/autoload.php is still missing.
    pause
    exit /b 1
)

:vendor_ready
echo    PHP dependencies are ready.

echo.
echo [5/6] Waiting for MySQL to be ready...
set RETRIES=0
:wait_db
set /a RETRIES+=1
if %RETRIES% gtr 30 (
    echo [ERROR] MySQL did not become ready after 30 attempts.
    pause
    exit /b 1
)
%COMPOSE_CMD% exec -T app php -r "try { new PDO('mysql:host=db;port=3306;dbname=mesoco_dental', 'mesoco', 'secret'); echo 'OK'; } catch(Exception $e) { exit(1); }" >nul 2>&1
if %errorlevel% neq 0 (
    echo    Waiting for MySQL... attempt %RETRIES%/30
    timeout /t 3 /nobreak >nul
    goto wait_db
)
echo    MySQL is ready!

echo.
echo [6/6] Creating database + demo data...
%COMPOSE_CMD% exec -T app php artisan migrate:fresh --seed
if %errorlevel% neq 0 (
    echo [ERROR] Migration or seeding failed!
    echo Try running manually:
    echo cd /d "%cd%"
    echo docker compose --env-file .env.runtime exec -T app php artisan migrate:fresh --seed
    pause
    exit /b 1
)

echo.
echo ========================================
echo  SETUP COMPLETE!
echo ========================================
echo.
echo  Open browser:
echo     Frontend:  see detected URL above
echo     Backend:   see detected URL above
echo     Laptop:    http://localhost:8000
echo.
echo  Test Accounts:
echo  +-----------+---------------+----------+
echo  ^| Role      ^| Employee Code ^| Password ^|
echo  +-----------+---------------+----------+
echo  ^| Manager   ^| E1001         ^| password ^|
echo  ^| Technician^| E1002         ^| password ^|
echo  ^| Employee  ^| E1003         ^| password ^|
echo  ^| Frontdesk ^| E1004         ^| password ^|
echo  ^| Warehouse ^| E1005         ^| password ^|
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
