@echo off
echo ========================================
echo  MESOCO DENTAL - DOCKER RESET
echo ========================================
echo.
echo  WARNING: This will delete ALL database data!
echo.
set /p confirm="Are you sure? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo Cancelled.
    exit /b
)

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

echo.
echo [1/4] Removing containers and volumes...
%COMPOSE_CMD% down -v

echo.
echo [2/4] Rebuilding images (no cache)...
%COMPOSE_CMD% build --no-cache

echo.
echo [3/4] Starting containers...
%COMPOSE_CMD% up -d

echo.
echo [4/5] Ensuring PHP dependencies are installed...
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
echo [5/5] Waiting for MySQL to be ready...
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
echo Running migrations + seeders...
%COMPOSE_CMD% exec -T app php artisan migrate:fresh --seed

echo.
echo ========================================
echo  Reset complete!
echo ========================================
echo.
echo  Frontend:  see detected URL above
echo  Backend:   see detected URL above
echo  Laptop:    http://localhost:8000
echo.
echo  Accounts:
echo    E1001 / password (Manager)
echo    E1002 / password (Technician)
echo    E1003 / password (Employee)
echo    E1004 / password (Frontdesk)
echo    E1005 / password (Warehouse)
echo ========================================
cd ..
cd ..
