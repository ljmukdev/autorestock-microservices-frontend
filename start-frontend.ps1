# StockPilot Frontend Startup Script
# Starts the API Gateway and serves the frontend

Write-Host "🚀 Starting StockPilot Frontend..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Navigate to API Gateway directory
Set-Location "C:\development\Projects\stockpilot\api-gateway"

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing API Gateway dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the API Gateway
Write-Host "🌐 Starting API Gateway on port 3000..." -ForegroundColor Cyan
Write-Host "📱 Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔗 API Gateway health check: http://localhost:3000/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow

npm start

