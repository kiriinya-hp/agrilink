@echo off
title AgriLink Database Studio
echo ===================================================================
echo   AgriLink Visual Database Management Console (Prisma Studio)
echo ===================================================================
echo.
echo Starting interactive database editor...
echo SQLite Database: dev.db
echo.
echo Opening browser at http://localhost:5555 ...
echo You can double-click ANY record to edit, add new rows, or delete!
echo.
cd backend
npx prisma studio
pause
