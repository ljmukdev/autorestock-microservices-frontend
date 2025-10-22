# Railway Deployment Helper Script for Windows
# AutoRestock Frontend Deployment

Write-Host "🚀 AutoRestock Frontend Deployment Helper" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Check if Railway CLI is installed
try {
    $railwayVersion = railway --version 2>$null
    Write-Host "✅ Railway CLI is installed: $railwayVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g @railway/cli" -ForegroundColor Yellow
    exit 1
}

# Check if logged in
try {
    railway whoami 2>$null | Out-Null
    Write-Host "✅ Logged into Railway" -ForegroundColor Green
} catch {
    Write-Host "🔐 Please login to Railway first:" -ForegroundColor Yellow
    Write-Host "   railway login" -ForegroundColor Yellow
    exit 1
}

Write-Host "🚀 Deploying frontend to Railway..." -ForegroundColor Blue
Write-Host "📁 Source directory: frontends/" -ForegroundColor Cyan
Write-Host "🔧 Build command: npm install" -ForegroundColor Cyan
Write-Host "▶️  Start command: npm start" -ForegroundColor Cyan

# Set environment variable for Railway working directory
$env:RAILWAY_WORKING_DIRECTORY = "frontends"

# Deploy
Write-Host "🚀 Starting deployment..." -ForegroundColor Blue
railway up --detach

Write-Host "✅ Deployment initiated!" -ForegroundColor Green
Write-Host "🌐 Check your Railway dashboard for deployment status" -ForegroundColor Cyan
