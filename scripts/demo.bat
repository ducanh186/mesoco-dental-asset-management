@echo off
REM ============================================================================
REM Mesoco Dental - Quick Local Smoke Test (NO DOCKER)
REM ============================================================================
REM Purpose: Fast validation of app basics - migrate, seed, routes, auth tests
REM Uses dedicated SQLite connection (sqlite_demo) - does NOT touch main .env
REM
REM Prerequisites: PHP 8.3+ in PATH, Composer dependencies installed
REM ============================================================================

setlocal enabledelayedexpansion
cd /d "%~dp0\.."

echo.
echo ========================================
echo Mesoco Quick Smoke Test
echo ========================================
echo.

REM === Check PHP ===
where php >nul 2>&1
if errorlevel 1 (
    echo [ERROR] PHP not found. Install PHP 8.3+ and add to PATH.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('php -r "echo PHP_VERSION;"') do echo PHP: %%i

REM === Setup .env if not exists ===
if not exist ".env" (
    echo [INFO] Creating .env from .env.example...
    copy .env.example .env >nul
    php artisan key:generate --ansi
)

REM === Create demo SQLite database file ===
if not exist "database\demo.sqlite" (
    echo [INFO] Creating demo.sqlite...
    type nul > "database\demo.sqlite"
)

echo.
echo ========================================
echo [1/4] Main Database Migration ^& Seed
echo ========================================
php artisan migrate:fresh --seed --force
if errorlevel 1 (
    echo [FAIL] Main database setup failed
    pause
    exit /b 1
)
echo [OK] Main database ready

echo.
echo ========================================
echo [2/4] Demo SQLite Migration
echo ========================================
php artisan migrate:fresh --force --database=sqlite_demo
if errorlevel 1 (
    echo [FAIL] Demo migration failed
    pause
    exit /b 1
)
echo [OK] Demo migrations complete

echo.
echo ========================================
echo [3/4] Demo Database Seeding
echo ========================================
php artisan db:seed --force --database=sqlite_demo
echo [OK] Demo seeding complete

echo.
echo ========================================
echo [4/4] Route List (Auth Routes)
echo ========================================
php artisan route:list --path=login
php artisan route:list --path=logout  
php artisan route:list --path=forgot-password
echo.

echo ========================================
echo SMOKE TEST COMPLETE
echo ========================================
echo.
echo Demo accounts:
echo   Admin      : E0001 / password
echo   Doctor     : E0002 / password
echo   Technician : E0003 / password
echo.
echo ========================================
echo Starting Dev Servers...
echo ========================================
echo.
echo Laravel: http://localhost:8000
echo Vite:    http://localhost:5173
echo.
echo Press Ctrl+C to stop servers.
echo ========================================
echo.

start "Vite Dev Server" cmd /k "cd /d %~dp0\.. && npm run dev"
timeout /t 2 /nobreak >nul
php artisan serve

endlocal
