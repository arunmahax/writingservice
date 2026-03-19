@echo off
echo ========================================
echo  Recipe Generator - Starting Server
echo ========================================
echo.
echo Starting API Server and Worker...
echo.

cd /d "%~dp0"
npm run dev:all

pause
