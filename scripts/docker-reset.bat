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

echo.
echo [1/4] Removing containers and volumes...
docker compose down -v

echo.
echo [2/4] Rebuilding images (no cache)...
docker compose build --no-cache

echo.
echo [3/4] Starting containers...
docker compose up -d

echo.
echo [4/4] Waiting for MySQL to be ready...
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
echo Running migrations + seeders...
docker compose exec app php artisan migrate:fresh --seed

echo.
echo ========================================
echo  Reset complete!
echo ========================================
echo.
echo  Frontend:  http://localhost:5173
echo  Backend:   http://localhost:8000
echo.
echo  Accounts:
echo    E0001 / password (Admin)
echo    E0002 / password (HR)
echo    E0003 / password (Doctor)
echo    E0004 / password (Technician)
echo    E0005 / password (Staff)
echo ========================================
cd ..
cd ..
