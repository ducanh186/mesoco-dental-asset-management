@echo off
echo ========================================
echo  Mesoco Dental - Docker Start
echo ========================================
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

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Desktop is not running!
    pause
    exit /b 1
)

%COMPOSE_CMD% up -d
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start containers!
    pause
    exit /b 1
)

echo.
echo Waiting for containers to start...
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
    ping -n 4 127.0.0.1 >nul
    goto wait_db
)
echo    MySQL is ready!

echo.
echo Running migrations (if any)...
%COMPOSE_CMD% exec -T app php artisan migrate --force

echo.
echo Seeding demo data (safe to run again)...
%COMPOSE_CMD% exec -T app php artisan db:seed --class=DatabaseSeeder --force

echo.
echo Clearing Laravel cache...
%COMPOSE_CMD% exec -T app php artisan config:clear
%COMPOSE_CMD% exec -T app php artisan cache:clear

echo.
echo ========================================
echo  Ready!
echo ========================================
echo.
echo  Frontend:  see detected URL above
echo  Backend:   see detected URL above
echo  Laptop:    http://localhost:8000
echo  Database:  localhost:3307
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
echo  To stop: scripts\docker-stop.bat
echo ========================================
cd ..
