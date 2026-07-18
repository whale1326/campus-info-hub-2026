@echo off
chcp 65001 >nul
echo ============================================
echo   Push to GitHub - campus-info-hub-2026
echo ============================================
echo.

cd /d D:\campus-info-hub

set GIT_SSL_NO_VERIFY=1
set GIT_DIR=C:\Users\kikilove\.workbuddy\campus-info-hub.git

echo Pushing new commits to GitHub...
echo.
git push -u origin main

echo.
echo ============================================
if %ERRORLEVEL% EQU 0 (
    echo   SUCCESS! All commits pushed to GitHub.
    echo   Repository: https://github.com/whale1326/campus-info-hub-2026
) else (
    echo   FAILED! Error code: %ERRORLEVEL%
    echo   If authentication failed, try logging in via browser first.
)
echo ============================================
echo.
pause
