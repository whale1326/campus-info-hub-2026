@echo off
chcp 65001 >nul
echo ============================================
echo   Push to GitHub - campus-info-hub-2026
echo ============================================
echo.

cd /d D:\campus-info-hub

set GIT_SSL_NO_VERIFY=1

echo [1/2] Committing changes...
git add -A
git commit -m "style: enhance UI with modern design and fix NavBar syntax error" 2>nul

echo [2/2] Pushing to GitHub...
git push -u origin main

echo.
echo ============================================
if %ERRORLEVEL% EQU 0 (
    echo   SUCCESS! Code pushed to GitHub.
) else (
    echo   FAILED! Error code: %ERRORLEVEL%
)
echo ============================================
echo.
pause
