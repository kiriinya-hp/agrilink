@echo off
echo ========================================================
echo  Launching AgriLink Full-Stack System (BBIT Capstone)
echo ========================================================
echo.
echo [1/3] Starting Backend API on http://localhost:5000 ...
start "AgriLink Backend API" cmd /k "cd backend && npm run dev"

echo [2/3] Starting Frontend Client on http://localhost:3000 ...
start "AgriLink Frontend UI" cmd /k "cd frontend && npm run dev"

echo [3/3] Waiting for servers to initialize...
timeout /t 4 /nobreak >nul

echo Opening browser at http://localhost:3000 ...
start http://localhost:3000

echo.
echo ========================================================
echo  AgriLink is running!
echo  Backend:  http://localhost:5000
echo  Frontend: http://localhost:3000
echo ========================================================
pause
