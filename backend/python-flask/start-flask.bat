@echo off
echo Starting Python Flask Backend...
echo.

cd /d "c:\Users\bever\crud\backend\python-flask"

echo Checking if Python is installed...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed or not in PATH!
    echo Please install Python from https://python.org/downloads/
    echo.
    pause
    exit /b 1
)

echo Python found! Installing dependencies...
pip install -r requirements_new.txt

echo.
echo Starting Flask application...
echo The application will be available at: http://localhost:5000
echo API endpoints will be available at: http://localhost:5000/api/
echo.
echo Default admin user: admin/admin123
echo.
echo Press Ctrl+C to stop the server
echo.

python server.py

echo.
echo Server stopped.
pause
