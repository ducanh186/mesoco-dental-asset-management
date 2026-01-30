@echo off
chcp 65001 >nul
echo ========================================
echo  Mesoco Dental - Docker Start
echo ========================================
echo.
echo  Mode: Local development with Docker
echo  No ngrok required - runs on localhost
echo.

cd /d "%~dp0.."
cd docker
docker compose up -d

echo.
echo Waiting for containers to start (5s)...
timeout /t 5 /nobreak >nul

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
