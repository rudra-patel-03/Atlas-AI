@echo off
title ATLAS AI Platform Launcher
cd /d "%~dp0"
echo ========================================================
echo               ATLAS AI PLATFORM LAUNCHER
echo ========================================================
echo.
echo Setting up environment...
set "PATH=C:\Program Files\nodejs;%PATH%"

echo.
echo Starting Next.js Server on http://localhost:3000 ...
echo (Keep this small window open while using the website)
echo.

:: Automatically open browser after 3 seconds
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000/dashboard"

:: Run Next.js server
call npm.cmd run dev

pause
