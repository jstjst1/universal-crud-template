# Universal CRUD Template - PowerShell Start Script
Write-Host "Starting Universal CRUD Template..." -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Starting Backend Server (Node.js)" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

# Start backend in new PowerShell window
$backendPath = Join-Path $PSScriptRoot "backend\node-express"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm start" -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Frontend Server (React)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Start frontend in new PowerShell window
$frontendPath = Join-Path $PSScriptRoot "frontend\react"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Both servers are starting..." -ForegroundColor Green
Write-Host "Backend: http://localhost:3000" -ForegroundColor White
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
