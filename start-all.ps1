# BSM Development Environment Startup Script
# PowerShell version

Write-Host "🚀 Starting BSM Development Environment..." -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Kill existing node processes
Write-Host "🔄 Cleaning up existing processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Wait a moment for ports to be freed
Start-Sleep -Seconds 2

# Start the comprehensive startup script
Write-Host "🚀 Starting all services..." -ForegroundColor Green
node start-all.js

Write-Host "Press any key to exit..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
