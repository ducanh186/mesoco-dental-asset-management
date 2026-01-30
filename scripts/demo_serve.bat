@echo off
REM ============================================================================
REM Mesoco Dental - Demo Server with ngrok
REM Exposes local Laravel app to the internet for remote demo
REM ============================================================================

echo.
echo  ====================================
echo   Mesoco Dental - Remote Demo Server
echo  ====================================
echo.

REM Check if ngrok is installed
where ngrok >nul 2>nul
if %ERRORLEVEL% neq 0 (
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

REM Navigate to project root
cd /d "%~dp0.."

echo [1/3] Starting Laravel development server...
start "Laravel Server" cmd /c "php artisan serve --host=127.0.0.1 --port=8000"

REM Wait for Laravel to start
timeout /t 3 /nobreak >nul

echo [2/3] Starting ngrok tunnel...
echo.
echo ============================================
echo  Share the "Forwarding" URL with your team
echo  Press Ctrl+C to stop the tunnel
echo ============================================
echo.

ngrok http 8000

REM Cleanup when ngrok is closed
echo.
echo [3/3] Shutting down Laravel server...
taskkill /FI "WINDOWTITLE eq Laravel Server" /F >nul 2>nul

echo.
echo Demo server stopped.
pause
