@echo off
title AgriLink Platform Launcher
color 0A

:: Ensure working directory is AgriLink root
cd /d "%~dp0"

echo ========================================================
echo       AgriLink - Starting Backend + Frontend
echo ========================================================
echo.

:: Automatically clear ports 5000 and 3000 if occupied by old sessions
echo  [1/4] Checking and clearing ports 5000 and 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000" ^| findstr "LISTENING"') do (
    if not "%%a"=="0" taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    if not "%%a"=="0" taskkill /f /pid %%a >nul 2>&1
)

:: Step 1: Start Backend API (Port 5000) in separate window
echo  [2/4] Starting Backend API Server (Port 5000)...
start "AgriLink Backend API (Port 5000)" cmd /k "cd /d "%~dp0backend" && npm run dev"

:: Safe 3-second delay
ping 127.0.0.1 -n 4 >nul

:: Step 2: Start Frontend Vite Dev Server (Port 3000) in separate window
echo  [3/4] Starting Frontend Vite App (Port 3000)...
start "AgriLink Frontend Vite (Port 3000)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

:: Safe 6-second delay for server boot
echo  [4/4] Initializing servers and launching browser...
ping 127.0.0.1 -n 7 >nul

:: Launch default browser
start http://localhost:3000

echo.
echo ========================================================
echo   Backend API is running at:  http://localhost:5000
echo   Frontend App is running at: http://localhost:3000
echo.
echo   Keep the two server command windows open while using
echo   AgriLink. Close them when you want to stop the app.
echo ========================================================
echo.
pause
