@echo off
echo Starting Universal CRUD Template...
echo.

echo ========================================
echo Starting Backend Server (Node.js)
echo ========================================
cd /d "%~dp0backend\node-express"
start "Backend Server" cmd /k "npm start"

echo.
echo ========================================
echo Starting Frontend Server (React)
echo ========================================
cd /d "%~dp0frontend\react"
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo Both servers are starting...
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
echo ========================================
echo.
echo Press any key to continue...
pause
