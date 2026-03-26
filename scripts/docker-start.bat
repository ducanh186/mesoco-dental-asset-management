@echo off
echo ========================================
echo  Mesoco Dental - Docker Start
echo ========================================
echo.

cd /d "%~dp0.."
cd docker

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Desktop is not running!
    pause
    exit /b 1
)

docker compose up -d
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
docker compose exec app php -r "try { new PDO('mysql:host=db;port=3306;dbname=mesoco_dental', 'mesoco', 'secret'); echo 'OK'; } catch(Exception \$e) { exit(1); }" >nul 2>&1
if %errorlevel% neq 0 (
    echo    Waiting for MySQL... attempt %RETRIES%/30
    timeout /t 3 /nobreak >nul
    goto wait_db
)
echo    MySQL is ready!

echo.
echo Running migrations (if any)...
docker compose exec app php artisan migrate --force

echo.
echo Clearing Laravel cache...
docker compose exec app php artisan config:clear
docker compose exec app php artisan cache:clear

echo.
echo ========================================
echo  Ready!
echo ========================================
echo.
echo  Frontend:  http://localhost:5173
echo  Backend:   http://localhost:8000
echo  Database:  localhost:3307
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
echo  To stop: scripts\docker-stop.bat
echo ========================================
cd ..
