# StockPilot Microservice Frontends Launcher Script
# PowerShell script to easily launch microservice frontends

param(
    [string]$Service = "all",
    [switch]$Help
)

# Service configurations
$services = @{
    "purchases" = @{
        "name" = "Purchases Service"
        "port" = 3001
        "path" = "purchases-service/index.html"
    }
    "sales" = @{
        "name" = "Sales Service"
        "port" = 3002
        "path" = "sales-service/index.html"
    }
    "ebay" = @{
        "name" = "eBay Service"
        "port" = 3003
        "path" = "ebay-service/index.html"
    }
    "inventory" = @{
        "name" = "Inventory Service"
        "port" = 3004
        "path" = "inventory-service/index.html"
    }
    "vinted" = @{
        "name" = "Vinted Service"
        "port" = 3005
        "path" = "vinted-service/index.html"
    }
    "media" = @{
        "name" = "Media Service"
        "port" = 3006
        "path" = "media-service/index.html"
    }
    "email" = @{
        "name" = "Email Service"
        "port" = 3007
        "path" = "email-ingestion-service/index.html"
    }
    "reporting" = @{
        "name" = "Reporting Service"
        "port" = 3008
        "path" = "reporting-service/index.html"
    }
}

function Show-Help {
    Write-Host "StockPilot Microservice Frontends Launcher" -ForegroundColor Cyan
    Write-Host "===========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\start-frontends.ps1 [Service] [Options]" -ForegroundColor White
    Write-Host ""
    Write-Host "Services:" -ForegroundColor Yellow
    foreach ($service in $services.Keys) {
        $serviceInfo = $services[$service]
        Write-Host "  $service" -ForegroundColor Green -NoNewline
        Write-Host " - $($serviceInfo.name) (Port: $($serviceInfo.port))" -ForegroundColor White
    }
    Write-Host "  all" -ForegroundColor Green -NoNewline
    Write-Host " - Launch all services" -ForegroundColor White
    Write-Host "  launcher" -ForegroundColor Green -NoNewline
    Write-Host " - Launch the main launcher interface" -ForegroundColor White
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  -Help" -ForegroundColor Green -NoNewline
    Write-Host " - Show this help message" -ForegroundColor White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\start-frontends.ps1 launcher" -ForegroundColor White
    Write-Host "  .\start-frontends.ps1 purchases" -ForegroundColor White
    Write-Host "  .\start-frontends.ps1 all" -ForegroundColor White
}

function Test-ServiceHealth {
    param([string]$ServiceName, [int]$Port)
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$Port/health" -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            return $true
        }
    }
    catch {
        return $false
    }
    return $false
}

function Start-ServiceFrontend {
    param([string]$ServiceName, [hashtable]$ServiceInfo)
    
    $frontendPath = Join-Path $PSScriptRoot $ServiceInfo.path
    
    if (Test-Path $frontendPath) {
        Write-Host "Launching $($ServiceInfo.name)..." -ForegroundColor Green
        
        # Check if service is running
        if (Test-ServiceHealth $ServiceName $ServiceInfo.port) {
            Write-Host "✓ Service is healthy on port $($ServiceInfo.port)" -ForegroundColor Green
        } else {
            Write-Host "⚠ Service may not be running on port $($ServiceInfo.port)" -ForegroundColor Yellow
            Write-Host "  Make sure to start the microservice first!" -ForegroundColor Yellow
        }
        
        # Launch the frontend
        Start-Process $frontendPath
    } else {
        Write-Host "✗ Frontend not found: $frontendPath" -ForegroundColor Red
    }
}

function Start-Launcher {
    $launcherPath = Join-Path $PSScriptRoot "launcher.html"
    
    if (Test-Path $launcherPath) {
        Write-Host "Launching StockPilot Microservice Frontend Launcher..." -ForegroundColor Cyan
        Start-Process $launcherPath
    } else {
        Write-Host "✗ Launcher not found: $launcherPath" -ForegroundColor Red
    }
}

function Start-AllServices {
    Write-Host "Launching all microservice frontends..." -ForegroundColor Cyan
    Write-Host ""
    
    foreach ($service in $services.Keys) {
        $serviceInfo = $services[$service]
        Start-ServiceFrontend $service $serviceInfo
        Start-Sleep -Seconds 1
    }
    
    Write-Host ""
    Write-Host "All frontends launched!" -ForegroundColor Green
}

# Main execution
if ($Help) {
    Show-Help
    exit 0
}

Write-Host "StockPilot Microservice Frontends" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

switch ($Service.ToLower()) {
    "launcher" {
        Start-Launcher
    }
    "all" {
        Start-AllServices
    }
    default {
        if ($services.ContainsKey($Service.ToLower())) {
            $serviceInfo = $services[$Service.ToLower()]
            Start-ServiceFrontend $Service.ToLower() $serviceInfo
        } else {
            Write-Host "✗ Unknown service: $Service" -ForegroundColor Red
            Write-Host ""
            Show-Help
        }
    }
}
