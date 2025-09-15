@echo off
REM StockPilot Microservice Frontends Launcher Script
REM Batch script to easily launch microservice frontends

setlocal enabledelayedexpansion

REM Service configurations
set "services=purchases sales ebay inventory vinted media email reporting"

if "%1"=="help" goto :help
if "%1"=="launcher" goto :launcher
if "%1"=="all" goto :all
if "%1"=="" goto :launcher

REM Check if service exists
for %%s in (%services%) do (
    if "%%s"=="%1" goto :service
)

echo Unknown service: %1
echo.
goto :help

:help
echo StockPilot Microservice Frontends Launcher
echo ===========================================
echo.
echo Usage:
echo   start-frontends.bat [Service] [Options]
echo.
echo Services:
echo   purchases  - Purchases Service (Port: 3001)
echo   sales      - Sales Service (Port: 3002)
echo   ebay       - eBay Service (Port: 3003)
echo   inventory  - Inventory Service (Port: 3004)
echo   vinted     - Vinted Service (Port: 3005)
echo   media      - Media Service (Port: 3006)
echo   email      - Email Service (Port: 3007)
echo   reporting  - Reporting Service (Port: 3008)
echo   all        - Launch all services
echo   launcher   - Launch the main launcher interface
echo.
echo Examples:
echo   start-frontends.bat launcher
echo   start-frontends.bat purchases
echo   start-frontends.bat all
goto :end

:launcher
echo Launching StockPilot Microservice Frontend Launcher...
start "" "%~dp0launcher.html"
goto :end

:service
echo Launching %1 service frontend...
start "" "%~dp0%1-service\index.html"
goto :end

:all
echo Launching all microservice frontends...
for %%s in (%services%) do (
    echo Starting %%s service...
    start "" "%~dp0%%s-service\index.html"
    timeout /t 1 /nobreak >nul
)
echo All frontends launched!
goto :end

:end
endlocal
