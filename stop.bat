@echo off
title MalikLabs - Stop Services
echo Stopping all services...
taskkill /F /IM nginx.exe >nul 2>&1
taskkill /F /IM uvicorn.exe >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo All services stopped.
pause
