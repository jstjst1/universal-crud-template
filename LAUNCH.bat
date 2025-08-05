@echo off
cls
echo ===============================================
echo          UNIVERSAL CRUD TEMPLATE
echo ===============================================
echo.
echo Choose your technology stack:
echo.
echo === FULL STACKS (Frontend + Backend) ===
echo 1. React + Node.js + MySQL (Most Popular)
echo 2. Angular + Java Spring Boot + MySQL (Enterprise)
echo 3. React + Python Flask + MySQL (Data Science)
echo 4. HTML/CSS/JS + PHP + MySQL (Traditional Web)
echo.
echo === BACKEND ONLY ===
echo 5. Node.js Express Server (Port 3000)
echo 6. Java Spring Boot Server (Port 8080)
echo 7. Python Flask Server (Port 5000)
echo 8. PHP Server (XAMPP Required)
echo.
echo === FRONTEND ONLY ===
echo 9. React Development Server (Port 5173)
echo 10. Angular Development Server (Port 4200)
echo 11. Vanilla HTML/CSS/JS (Live Server)
echo.
echo === UTILITIES ===
echo 12. Setup Database (MySQL/PostgreSQL)
echo 13. Install All Dependencies
echo 14. View Documentation
echo 15. Exit
echo.
set /p choice="Enter your choice (1-15): "

if "%choice%"=="1" goto react_node
if "%choice%"=="2" goto angular_java
if "%choice%"=="3" goto react_flask
if "%choice%"=="4" goto html_php
if "%choice%"=="5" goto node_only
if "%choice%"=="6" goto java_only
if "%choice%"=="7" goto flask_only
if "%choice%"=="8" goto php_only
if "%choice%"=="9" goto react_only
if "%choice%"=="10" goto angular_only
if "%choice%"=="11" goto html_only
if "%choice%"=="12" goto setup_db
if "%choice%"=="13" goto install_deps
if "%choice%"=="14" goto docs
if "%choice%"=="15" goto exit
echo Invalid choice. Please try again.
pause
goto start

:react_node
echo.
echo Starting React + Node.js + MySQL Stack...
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
echo.
start "Node.js Backend" cmd /k "cd /d c:\Users\bever\crud\backend\node-express && npm start"
timeout /t 3 /nobreak >nul
start "React Frontend" cmd /k "cd /d c:\Users\bever\crud\frontend\react && npm run dev"
echo Both servers starting... Check the opened terminal windows.
pause
goto start

:angular_java
echo.
echo Starting Angular + Java Spring Boot + MySQL Stack...
echo Backend: http://localhost:8080
echo Frontend: http://localhost:4200
echo.
start "Java Spring Boot Backend" cmd /k "cd /d c:\Users\bever\crud\backend\java-spring && mvn spring-boot:run"
timeout /t 5 /nobreak >nul
start "Angular Frontend" cmd /k "cd /d c:\Users\bever\crud\frontend\angular && ng serve"
echo Both servers starting... Check the opened terminal windows.
pause
goto start

:react_flask
echo.
echo Starting React + Python Flask + MySQL Stack...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
start "Python Flask Backend" cmd /k "cd /d c:\Users\bever\crud\backend\python-flask && python server.py"
timeout /t 3 /nobreak >nul
start "React Frontend" cmd /k "cd /d c:\Users\bever\crud\frontend\react && npm run dev"
echo Both servers starting... Check the opened terminal windows.
pause
goto start

:html_php
echo.
echo Starting HTML + PHP + MySQL Stack...
echo Make sure XAMPP is running with Apache and MySQL!
echo Access via: http://localhost/php-crud
echo.
echo Copy the PHP backend to your XAMPP htdocs folder:
echo From: c:\Users\bever\crud\backend\php
echo To: C:\xampp\htdocs\php-crud
echo.
pause
goto start

:node_only
echo.
echo Starting Node.js Express Server...
start "Node.js Backend" cmd /k "cd /d c:\Users\bever\crud\backend\node-express && npm start"
echo Server starting at http://localhost:3000
pause
goto start

:java_only
echo.
echo Starting Java Spring Boot Server...
start "Java Spring Boot Backend" cmd /k "cd /d c:\Users\bever\crud\backend\java-spring && mvn spring-boot:run"
echo Server starting at http://localhost:8080
pause
goto start

:flask_only
echo.
echo Starting Python Flask Server...
start "Python Flask Backend" cmd /k "cd /d c:\Users\bever\crud\backend\python-flask && python server.py"
echo Server starting at http://localhost:5000
pause
goto start

:php_only
echo.
echo Starting PHP Server...
echo Make sure XAMPP is running with Apache and MySQL!
echo Access via: http://localhost/php-crud
pause
goto start

:react_only
echo.
echo Starting React Development Server...
start "React Frontend" cmd /k "cd /d c:\Users\bever\crud\frontend\react && npm run dev"
echo Server starting at http://localhost:5173
pause
goto start

:angular_only
echo.
echo Starting Angular Development Server...
start "Angular Frontend" cmd /k "cd /d c:\Users\bever\crud\frontend\angular && ng serve"
echo Server starting at http://localhost:4200
pause
goto start

:html_only
echo.
echo Opening Vanilla HTML/CSS/JS...
start "" "c:\Users\bever\crud\frontend\vanilla\index.html"
echo HTML file opened in default browser
pause
goto start

:setup_db
echo.
echo Database Setup Instructions:
echo.
echo === MySQL Setup ===
echo 1. Install MySQL or use XAMPP
echo 2. Create database: CREATE DATABASE universal_crud;
echo 3. Import schema: mysql -u root -p universal_crud ^< database/mysql/schema.sql
echo.
echo === PostgreSQL Setup ===
echo 1. Install PostgreSQL
echo 2. Create database: createdb universal_crud
echo 3. Import schema: psql -d universal_crud -f database/postgresql/schema.sql
echo.
echo See database/ folder for SQL files
pause
goto start

:install_deps
echo.
echo Installing all dependencies...
echo.
echo Installing Node.js dependencies...
cd /d "c:\Users\bever\crud\backend\node-express"
call npm install
cd /d "c:\Users\bever\crud\frontend\react"
call npm install
cd /d "c:\Users\bever\crud\frontend\angular"
call npm install
echo.
echo Installing Python dependencies...
cd /d "c:\Users\bever\crud\backend\python-flask"
pip install -r requirements_new.txt
echo.
echo Dependencies installed! Note: Java/Maven and PHP/Composer need manual setup.
pause
goto start

:docs
echo.
echo Opening Documentation...
echo.
echo Main README: README.md
echo Node.js Backend: backend/node-express/README.md
echo Java Backend: backend/java-spring/README.md
echo Python Backend: backend/python-flask/README.md
echo React Frontend: frontend/react/README.md
echo Database Schemas: database/
echo.
start notepad.exe "c:\Users\bever\crud\README.md"
pause
goto start

:exit
echo.
echo Thank you for using Universal CRUD Template!
echo Perfect for your Fiverr projects and web development needs.
echo.
pause
exit

:start
