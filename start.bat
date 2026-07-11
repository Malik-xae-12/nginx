@echo off
title MalikLabs Inventory - Server Startup
color 0A

echo ============================================
echo   MalikLabs Inventory Management System
echo   Domain: localhost
echo ============================================
echo.

:: Kill any existing processes
echo [1/3] Stopping existing services...
taskkill /F /IM nginx.exe >nul 2>&1
taskkill /F /IM uvicorn.exe >nul 2>&1
timeout /t 2 >nul

:: Start FastAPI backend
echo [2/3] Starting FastAPI backend on port 8000...
cd /d d:\domain\backend
start /B "" python -m uvicorn main:app --host 127.0.0.1 --port 8000
timeout /t 3 >nul

:: Start Nginx
echo [3/3] Starting Nginx on port 80...
cd /d d:\domain\nginx
start /B "" nginx.exe
timeout /t 2 >nul

echo.
echo ============================================
echo   All services started successfully!
echo.
echo   Frontend:  http://localhost
echo   API:       http://localhost/api/health
echo   API Docs:  http://127.0.0.1:8000/docs
echo ============================================
echo.
echo Press any key to stop all services...
pause >nul

:: Cleanup
echo Stopping services...
taskkill /F /IM nginx.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1
echo Done!
