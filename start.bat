@echo off
title AgriLink Platform Launcher
color 0A
echo ========================================================
echo       Starting AgriLink (Backend + Frontend)
echo ========================================================

echo [1/2] Starting Backend API Server (Port 5000)...
start "AgriLink Backend API (Port 5000)" cmd /k "cd /d "%~dp0backend" && npm run dev"

echo [2/2] Starting Frontend Vite Dev Server (Port 3000)...
start "AgriLink Frontend Vite (Port 3000)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo Waiting for servers to initialize...
timeout /t 3 /nobreak >nul

echo Opening AgriLink in your default browser...
start http://localhost:3000

echo.
echo ========================================================
echo   Backend is running at:  http://localhost:5000
echo   Frontend is running at: http://localhost:3000
echo ========================================================
