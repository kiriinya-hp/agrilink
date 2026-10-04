@echo off
title AgriLink Platform Launcher
color 0A

:: Store the project root path safely (no nested quote issues)
set "ROOTDIR=%~dp0"

echo ========================================================
echo       AgriLink - Starting Backend + Frontend
echo ========================================================
echo.

:: Step 1: Start Backend API (Port 5000) in its own window
echo  [1/2]  Backend API starting at http://localhost:5000 ...
start "AgriLink Backend API  [PORT 5000]" cmd /k "cd /d %ROOTDIR%backend && npm run dev"

:: Small gap before starting frontend
timeout /t 2 /nobreak >nul

:: Step 2: Start Frontend Vite Dev Server (Port 3000) in its own window
echo  [2/2]  Frontend Vite starting at http://localhost:3000 ...
start "AgriLink Frontend Vite [PORT 3000]" cmd /k "cd /d %ROOTDIR%frontend && npm run dev"

:: Give both servers enough time to fully initialize
echo.
echo  Waiting for servers to initialize (8 seconds)...
timeout /t 8 /nobreak >nul

:: Open browser at frontend dev server
echo  Opening browser at http://localhost:3000 ...
start http://localhost:3000

echo.
echo ========================================================
echo   Backend API:   http://localhost:5000
echo   Frontend App:  http://localhost:3000
echo   Close either command window to stop that server.
echo ========================================================
