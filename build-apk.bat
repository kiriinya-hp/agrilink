@echo off
setlocal enabledelayedexpansion
title AgriShamba - One-Click APK Builder

echo ===================================================
echo       AGRISHAMBA MOBILE APP AUTO-BUILDER
echo ===================================================
echo.

set "PROJECT_ROOT=C:\Users\USER11\Desktop\agrilink"
set "FRONTEND_DIR=%PROJECT_ROOT%\frontend"
set "ANDROID_DIR=%FRONTEND_DIR%\android"
set "OUTPUT_DIR=C:\Users\USER11\Desktop\Agrishamba"
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo [1/4] Building web assets (Vite)...
cd /d "%FRONTEND_DIR%"
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Web build failed. Please check your JavaScript/JSX code.
    pause
    exit /b %errorlevel%
)
echo [OK] Web build successful!
echo.

echo [2/4] Syncing assets to Android (Capacitor)...
call npx cap sync android
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Capacitor sync failed.
    pause
    exit /b %errorlevel%
)
echo [OK] Capacitor sync successful!
echo.

echo [3/4] Compiling Signed Release APK (Gradle)...
cd /d "%ANDROID_DIR%"
call gradlew.bat assembleRelease --no-daemon
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Gradle build failed.
    pause
    exit /b %errorlevel%
)
echo [OK] Gradle build successful!
echo.

echo [4/4] Copying APK to Desktop...
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"
set "APK_SRC=%ANDROID_DIR%\app\build\outputs\apk\release\app-release.apk"
set "APK_DEST=%OUTPUT_DIR%\AgriShamba_Latest_Release.apk"

copy /y "%APK_SRC%" "%APK_DEST%" >nul
if %errorlevel% neq 0 (
    echo [WARNING] Could not copy APK to %OUTPUT_DIR%.
) else (
    echo [OK] Fresh APK copied to:
    echo      %APK_DEST%
)

echo.
echo ===================================================
echo       BUILD COMPLETED SUCCESSFULLY!
echo  Install AgriShamba_Latest_Release.apk on your phone.
echo ===================================================
echo.
pause
