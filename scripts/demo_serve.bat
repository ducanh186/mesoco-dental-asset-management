@echo off
REM ============================================================================
REM Mesoco Dental - Remote Demo Server with ngrok
REM Exposes local Laravel app to the internet for remote demo
REM ============================================================================
REM Purpose: Share app with remote users via ngrok tunnel
REM Note: This script modifies .env temporarily for ngrok session
REM ============================================================================

setlocal enabledelayedexpansion
cd /d "%~dp0.."

echo.
echo  ====================================================
echo   Mesoco Dental - Remote Demo Server (ngrok)
echo  ====================================================
echo.

REM === Check prerequisites ===
where php >nul 2>&1
if errorlevel 1 (
    echo [ERROR] PHP not found. Install PHP 8.3+ and add to PATH.
    pause
    exit /b 1
)

where ngrok >nul 2>&1
if errorlevel 1 (
    echo [ERROR] ngrok is not installed or not in PATH
    echo.
    echo Please install ngrok:
    echo   1. Download from https://ngrok.com/download
    echo   2. Extract and add to PATH
    echo   3. Run: ngrok config add-authtoken YOUR_TOKEN
    echo.
    pause
    exit /b 1
)

REM === Backup original .env ===
echo [1/6] Backing up .env...
copy .env .env.backup >nul

REM === Start ngrok first to get the URL ===
echo [2/6] Starting ngrok tunnel...
start "ngrok" cmd /c "ngrok http 8000 --log=stdout > ngrok.log 2>&1"

REM Wait for ngrok to start and get URL
echo Waiting for ngrok to initialize...
timeout /t 5 /nobreak >nul

REM Try to get ngrok URL from API
for /f "tokens=*" %%i in ('powershell -Command "(Invoke-WebRequest -Uri http://127.0.0.1:4040/api/tunnels -UseBasicParsing | ConvertFrom-Json).tunnels[0].public_url" 2^>nul') do set NGROK_URL=%%i

if "%NGROK_URL%"=="" (
    echo [WARN] Could not auto-detect ngrok URL.
    echo Please check ngrok window and update .env manually if needed.
    set NGROK_URL=https://YOUR-SUBDOMAIN.ngrok-free.dev
) else (
    echo [OK] ngrok URL: %NGROK_URL%
)

REM Extract domain from URL (remove https://)
for /f "tokens=2 delims=/" %%a in ("%NGROK_URL%") do set NGROK_DOMAIN=%%a

REM === Update .env for ngrok ===
echo [3/6] Configuring .env for ngrok...
powershell -Command "(Get-Content .env) -replace 'APP_URL=.*', 'APP_URL=%NGROK_URL%' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace 'SESSION_DOMAIN=.*', 'SESSION_DOMAIN=%NGROK_DOMAIN%' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace 'SANCTUM_STATEFUL_DOMAINS=.*', 'SANCTUM_STATEFUL_DOMAINS=localhost,localhost:8000,127.0.0.1,127.0.0.1:8000,%NGROK_DOMAIN%' | Set-Content .env"

REM Add ASSET_URL if not exists, or update it
powershell -Command "if ((Get-Content .env) -notmatch 'ASSET_URL=') { Add-Content .env 'ASSET_URL=%NGROK_URL%' } else { (Get-Content .env) -replace 'ASSET_URL=.*', 'ASSET_URL=%NGROK_URL%' | Set-Content .env }"

REM Add secure cookie settings for HTTPS
powershell -Command "if ((Get-Content .env) -notmatch 'SESSION_SECURE_COOKIE=') { Add-Content .env 'SESSION_SECURE_COOKIE=true' } else { (Get-Content .env) -replace 'SESSION_SECURE_COOKIE=.*', 'SESSION_SECURE_COOKIE=true' | Set-Content .env }"
powershell -Command "if ((Get-Content .env) -notmatch 'SESSION_SAME_SITE=') { Add-Content .env 'SESSION_SAME_SITE=none' } else { (Get-Content .env) -replace 'SESSION_SAME_SITE=.*', 'SESSION_SAME_SITE=none' | Set-Content .env }"

REM === Build production assets ===
echo [4/6] Building production assets...
call npm run build
if errorlevel 1 (
    echo [ERROR] Failed to build assets
    goto :cleanup
)

REM === Clear Laravel cache ===
echo [5/6] Clearing Laravel cache...
php artisan config:clear
php artisan cache:clear
php artisan view:clear

REM === Start Laravel server ===
echo [6/6] Starting Laravel server...
echo.
echo ============================================================
echo  REMOTE DEMO READY!
echo ============================================================
echo.
echo  Share this URL with your team:
echo  %NGROK_URL%
echo.
echo  (They need to click "Visit Site" on ngrok warning page)
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
echo  Press Ctrl+C to stop the server
echo ============================================================
echo.

php artisan serve --host=0.0.0.0 --port=8000

:cleanup
echo.
echo Shutting down...

REM Kill ngrok
taskkill /FI "WINDOWTITLE eq ngrok" /F >nul 2>&1

REM Restore original .env
echo Restoring original .env...
if exist .env.backup (
    copy .env.backup .env >nul
    del .env.backup >nul
)
del ngrok.log >nul 2>&1

php artisan config:clear >nul 2>&1

echo.
echo Demo server stopped. .env restored to localhost config.
pause
endlocal
