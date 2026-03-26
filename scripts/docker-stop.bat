@echo off
echo ========================================
echo  Mesoco Dental - Docker Stop
echo ========================================
echo.

cd /d "%~dp0.."
cd docker
docker compose down

echo.
echo  All containers stopped.
echo.
echo  To start again: scripts\docker-start.bat
echo ========================================
cd ..
