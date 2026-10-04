@echo off
title AgriLink Platform Server
color 0A
echo ========================================================
echo       Starting AgriLink B2B Agribusiness Platform
echo ========================================================
echo [1/2] Opening AgriLink in your default web browser...
start http://localhost:5000
echo [2/2] Starting Node.js backend server...
cd /d "%~dp0backend"
node src/server.js
pause
