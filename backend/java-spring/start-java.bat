@echo off
echo Starting Java Spring Boot Backend...
echo.

cd /d "c:\Users\bever\crud\backend\java-spring"

echo Checking if Maven is installed...
mvn --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Maven is not installed or not in PATH!
    echo Please install Maven from https://maven.apache.org/download.cgi
    echo.
    pause
    exit /b 1
)

echo Maven found! Starting Spring Boot application...
echo.
echo The application will be available at: http://localhost:8080
echo API endpoints will be available at: http://localhost:8080/api/
echo.
echo Press Ctrl+C to stop the server
echo.

mvn spring-boot:run

echo.
echo Server stopped.
pause
