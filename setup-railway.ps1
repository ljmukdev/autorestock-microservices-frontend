# StockPilot Railway Setup Script
# This script helps set up Railway deployment for StockPilot microservices

Write-Host "🚀 StockPilot Railway Setup" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Check if Railway CLI is installed
try {
    $railwayVersion = railway --version
    Write-Host "✅ Railway CLI version: $railwayVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g @railway/cli
    Write-Host "✅ Railway CLI installed" -ForegroundColor Green
}

# Check if user is logged in
try {
    $user = railway whoami
    Write-Host "✅ Logged in as: $user" -ForegroundColor Green
} catch {
    Write-Host "❌ Not logged in to Railway. Please run: railway login" -ForegroundColor Red
    Write-Host "   Then run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📋 Railway Setup Checklist:" -ForegroundColor Cyan
Write-Host "1. Create a new Railway project" -ForegroundColor White
Write-Host "2. Deploy API Gateway service" -ForegroundColor White
Write-Host "3. Deploy microservices" -ForegroundColor White
Write-Host "4. Configure environment variables" -ForegroundColor White
Write-Host "5. Add MongoDB database" -ForegroundColor White
Write-Host ""

# Ask if user wants to create a new project
$createProject = Read-Host "Do you want to create a new Railway project? (y/n)"
if ($createProject -eq "y" -or $createProject -eq "Y") {
    Write-Host "🔧 Creating new Railway project..." -ForegroundColor Yellow
    railway project new
}

# Deploy API Gateway
Write-Host ""
Write-Host "🌐 Deploying API Gateway..." -ForegroundColor Cyan
Set-Location "api-gateway"
railway up
Set-Location ".."

Write-Host ""
Write-Host "📊 Deploying Core Services..." -ForegroundColor Cyan

# Core services
$coreServices = @(
    "purchases-service",
    "sales-service", 
    "inventory-service",
    "settings-service"
)

foreach ($service in $coreServices) {
    Write-Host "Deploying $service..." -ForegroundColor Yellow
    Set-Location "microservices\$service"
    railway up
    Set-Location "../.."
}

Write-Host ""
Write-Host "🔗 Deploying Integration Services..." -ForegroundColor Cyan

# Integration services
$integrationServices = @(
    "ebay-service",
    "vinted-service",
    "email-ingestion-service"
)

foreach ($service in $integrationServices) {
    Write-Host "Deploying $service..." -ForegroundColor Yellow
    Set-Location "microservices\$service"
    railway up
    Set-Location "../.."
}

Write-Host ""
Write-Host "🛠️ Deploying Support Services..." -ForegroundColor Cyan

# Support services
$supportServices = @(
    "reporting-service",
    "media-service",
    "accounting-integration-service",
    "rules-engine-service",
    "auto-buying-service",
    "ad-generator-service",
    "status-service"
)

foreach ($service in $supportServices) {
    Write-Host "Deploying $service..." -ForegroundColor Yellow
    Set-Location "microservices\$service"
    railway up
    Set-Location "../.."
}

Write-Host ""
Write-Host "✅ Railway Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Add MongoDB database in Railway dashboard" -ForegroundColor White
Write-Host "2. Configure environment variables for each service" -ForegroundColor White
Write-Host "3. Set up custom domain (optional)" -ForegroundColor White
Write-Host "4. Test your deployment" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Useful Commands:" -ForegroundColor Cyan
Write-Host "  railway status          - Check service status" -ForegroundColor White
Write-Host "  railway logs            - View service logs" -ForegroundColor White
Write-Host "  railway variables       - Manage environment variables" -ForegroundColor White
Write-Host "  railway domain          - Manage custom domains" -ForegroundColor White
Write-Host ""
Write-Host "📖 For detailed instructions, see DEPLOYMENT.md" -ForegroundColor Yellow
