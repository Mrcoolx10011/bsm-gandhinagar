@echo off
echo Starting BSM Development Environment...
echo =====================================

:: Kill existing node processes
taskkill /F /IM node.exe >nul 2>&1

:: Wait a moment
timeout /t 2 >nul

:: Start the comprehensive startup script
node start-all.js

pause
