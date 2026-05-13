@echo off
echo ========================================
echo  Mesoco LAN IP Helper
echo ========================================
echo.
echo Use this address when your phone and laptop are on the same Wi-Fi.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0write-runtime-env.ps1" -NoWrite

echo Tip: localhost works only on the laptop itself.
echo.
