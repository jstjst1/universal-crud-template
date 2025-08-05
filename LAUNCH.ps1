# UNIVERSAL CRUD TEMPLATE - LAUNCHER
# PowerShell version of the launcher

function Show-Menu {
    Clear-Host
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host "          UNIVERSAL CRUD TEMPLATE" -ForegroundColor Cyan
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Choose your technology stack:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "=== FULL STACKS (Frontend + Backend) ===" -ForegroundColor Green
    Write-Host "1. React + Node.js + MySQL (Most Popular)"
    Write-Host "2. Angular + Java Spring Boot + MySQL (Enterprise)"
    Write-Host "3. React + Python Flask + MySQL (Data Science)"
    Write-Host "4. HTML/CSS/JS + PHP + MySQL (Traditional Web)"
    Write-Host ""
    Write-Host "=== BACKEND ONLY ===" -ForegroundColor Green
    Write-Host "5. Node.js Express Server (Port 3000)"
    Write-Host "6. Java Spring Boot Server (Port 8080)"
    Write-Host "7. Python Flask Server (Port 5000)"
    Write-Host "8. PHP Server (XAMPP Required)"
    Write-Host ""
    Write-Host "=== FRONTEND ONLY ===" -ForegroundColor Green
    Write-Host "9. React Development Server (Port 5173)"
    Write-Host "10. Angular Development Server (Port 4200)"
    Write-Host "11. Vanilla HTML/CSS/JS (Live Server)"
    Write-Host ""
    Write-Host "=== UTILITIES ===" -ForegroundColor Green
    Write-Host "12. Setup Database (MySQL/PostgreSQL)"
    Write-Host "13. Install All Dependencies"
    Write-Host "14. View Documentation"
    Write-Host "15. Exit"
    Write-Host ""
}

function Start-ReactNode {
    Write-Host "Starting React + Node.js + MySQL Stack..." -ForegroundColor Yellow
    Write-Host "Backend: http://localhost:3000" -ForegroundColor Green
    Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\bever\crud\backend\node-express'; npm start"
    Start-Sleep 3
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\bever\crud\frontend\react'; npm run dev"
    
    Write-Host "Both servers starting... Check the opened PowerShell windows." -ForegroundColor Cyan
}

function Start-AngularJava {
    Write-Host "Starting Angular + Java Spring Boot + MySQL Stack..." -ForegroundColor Yellow
    Write-Host "Backend: http://localhost:8080" -ForegroundColor Green
    Write-Host "Frontend: http://localhost:4200" -ForegroundColor Green
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\bever\crud\backend\java-spring'; mvn spring-boot:run"
    Start-Sleep 5
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\bever\crud\frontend\angular'; ng serve"
    
    Write-Host "Both servers starting... Check the opened PowerShell windows." -ForegroundColor Cyan
}

function Start-ReactFlask {
    Write-Host "Starting React + Python Flask + MySQL Stack..." -ForegroundColor Yellow
    Write-Host "Backend: http://localhost:5000" -ForegroundColor Green
    Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\bever\crud\backend\python-flask'; python server.py"
    Start-Sleep 3
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\bever\crud\frontend\react'; npm run dev"
    
    Write-Host "Both servers starting... Check the opened PowerShell windows." -ForegroundColor Cyan
}

function Install-Dependencies {
    Write-Host "Installing all dependencies..." -ForegroundColor Yellow
    
    Write-Host "Installing Node.js dependencies..." -ForegroundColor Cyan
    Set-Location "C:\Users\bever\crud\backend\node-express"
    npm install
    
    Set-Location "C:\Users\bever\crud\frontend\react"
    npm install
    
    Set-Location "C:\Users\bever\crud\frontend\angular"
    npm install
    
    Write-Host "Installing Python dependencies..." -ForegroundColor Cyan
    Set-Location "C:\Users\bever\crud\backend\python-flask"
    pip install -r requirements_new.txt
    
    Write-Host "Dependencies installed! Note: Java/Maven and PHP/Composer need manual setup." -ForegroundColor Green
}

function Show-DatabaseSetup {
    Write-Host "Database Setup Instructions:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "=== MySQL Setup ===" -ForegroundColor Green
    Write-Host "1. Install MySQL or use XAMPP"
    Write-Host "2. Create database: CREATE DATABASE universal_crud;"
    Write-Host "3. Import schema: mysql -u root -p universal_crud < database/mysql/schema.sql"
    Write-Host ""
    Write-Host "=== PostgreSQL Setup ===" -ForegroundColor Green
    Write-Host "1. Install PostgreSQL"
    Write-Host "2. Create database: createdb universal_crud"
    Write-Host "3. Import schema: psql -d universal_crud -f database/postgresql/schema.sql"
    Write-Host ""
    Write-Host "See database/ folder for SQL files" -ForegroundColor Cyan
}

# Main loop
do {
    Show-Menu
    $choice = Read-Host "Enter your choice (1-15)"
    
    switch ($choice) {
        "1" { Start-ReactNode }
        "2" { Start-AngularJava }
        "3" { Start-ReactFlask }
        "4" { 
            Write-Host "Starting HTML + PHP + MySQL Stack..." -ForegroundColor Yellow
            Write-Host "Make sure XAMPP is running with Apache and MySQL!" -ForegroundColor Red
            Write-Host "Copy PHP backend to: C:\xampp\htdocs\php-crud" -ForegroundColor Cyan
        }
        "5" { 
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\bever\crud\backend\node-express'; npm start"
            Write-Host "Node.js server starting at http://localhost:3000" -ForegroundColor Green
        }
        "6" { 
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\bever\crud\backend\java-spring'; mvn spring-boot:run"
            Write-Host "Java Spring Boot server starting at http://localhost:8080" -ForegroundColor Green
        }
        "7" { 
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\bever\crud\backend\python-flask'; python server.py"
            Write-Host "Python Flask server starting at http://localhost:5000" -ForegroundColor Green
        }
        "8" { 
            Write-Host "Make sure XAMPP is running! Access via: http://localhost/php-crud" -ForegroundColor Yellow
        }
        "9" { 
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\bever\crud\frontend\react'; npm run dev"
            Write-Host "React server starting at http://localhost:5173" -ForegroundColor Green
        }
        "10" { 
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\bever\crud\frontend\angular'; ng serve"
            Write-Host "Angular server starting at http://localhost:4200" -ForegroundColor Green
        }
        "11" { 
            Start-Process "C:\Users\bever\crud\frontend\vanilla\index.html"
            Write-Host "HTML file opened in default browser" -ForegroundColor Green
        }
        "12" { Show-DatabaseSetup }
        "13" { Install-Dependencies }
        "14" { 
            Write-Host "Opening documentation..." -ForegroundColor Yellow
            Start-Process notepad "C:\Users\bever\crud\README.md"
        }
        "15" { 
            Write-Host "Thank you for using Universal CRUD Template!" -ForegroundColor Cyan
            Write-Host "Perfect for your Fiverr projects!" -ForegroundColor Green
            exit
        }
        default { 
            Write-Host "Invalid choice. Please try again." -ForegroundColor Red
        }
    }
    
    if ($choice -ne "15") {
        Write-Host ""
        Read-Host "Press Enter to continue"
    }
} while ($choice -ne "15")
