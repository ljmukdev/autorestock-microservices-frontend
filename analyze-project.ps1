# AutoRestock Project Structure Analyzer
# This script analyzes the project structure and outputs detailed information

# Set the specific project path
$projectPath = "C:\development\Projects\autorestock"
Set-Location -Path $projectPath

$outputFile = "PROJECT_ANALYSIS.txt"
$projectRoot = Get-Location

Write-Host "🔍 Analyzing AutoRestock project structure..."
Write-Host "📁 Project root: $projectRoot"
Write-Host "📄 Output file: $outputFile"

# Start output file
@"
========================================
AUTORESTOCK PROJECT STRUCTURE ANALYSIS
========================================
Generated: $(Get-Date)
Project Root: $projectRoot

"@ | Out-File -FilePath $outputFile -Encoding UTF8

# Function to safely get file content
function Get-SafeContent($filePath, $maxLines = 50) {
    try {
        if (Test-Path $filePath) {
            $content = Get-Content $filePath -First $maxLines
            return $content -join "`n"
        } else {
            return "FILE NOT FOUND"
        }
    } catch {
        return "ERROR READING FILE: $_"
    }
}

    # Check for AutoRestock subdirectory and navigate into it if it exists
    if (Test-Path "AutoRestock") {
        "📁 Found AutoRestock subdirectory, analyzing that..." | Out-File -FilePath $outputFile -Append -Encoding UTF8
        Set-Location "AutoRestock"
        $projectRoot = Get-Location
        "Updated project root: $projectRoot" | Out-File -FilePath $outputFile -Append -Encoding UTF8
    }

# 1. ROOT LEVEL ANALYSIS
@"
========================================
1. ROOT LEVEL FILES
========================================
"@ | Out-File -FilePath $outputFile -Append -Encoding UTF8

Get-ChildItem -Path . -File | ForEach-Object {
    "📄 $($_.Name) ($(($_.Length/1KB).ToString('F1'))KB)" | Out-File -FilePath $outputFile -Append -Encoding UTF8
}

# 2. KEY FILE CONTENTS
@"

========================================
2. CRITICAL FILE CONTENTS
========================================

--- ROOT package.json ---
"@ | Out-File -FilePath $outputFile -Append -Encoding UTF8

Get-SafeContent "package.json" | Out-File -FilePath $outputFile -Append -Encoding UTF8

@"

--- ROOT server.js (first 30 lines) ---
"@ | Out-File -FilePath $outputFile -Append -Encoding UTF8

Get-SafeContent "server.js" 30 | Out-File -FilePath $outputFile -Append -Encoding UTF8

@"

--- railway.json ---
"@ | Out-File -FilePath $outputFile -Append -Encoding UTF8

Get-SafeContent "railway.json" | Out-File -FilePath $outputFile -Append -Encoding UTF8

# 3. FRONTEND FOLDER ANALYSIS
@"

========================================
3. FRONTEND FOLDER ANALYSIS
========================================
"@ | Out-File -FilePath $outputFile -Append -Encoding UTF8

if (Test-Path "frontend") {
    "✅ frontend/ directory exists" | Out-File -FilePath $outputFile -Append -Encoding UTF8
    
    # List all files in frontend
    "📁 Contents:" | Out-File -FilePath $outputFile -Append -Encoding UTF8
    Get-ChildItem -Path "frontend" -Recurse -File | ForEach-Object {
        $relativePath = $_.FullName.Replace((Resolve-Path "frontend").Path + "\", "")
        "   📄 $relativePath ($(($_.Length/1KB).ToString('F1'))KB)" | Out-File -FilePath $outputFile -Append -Encoding UTF8
    }
    
    # Check for key frontend files
    @"

🔍 KEY FRONTEND FILES CHECK:
"@ | Out-File -FilePath $outputFile -Append -Encoding UTF8
    
    $frontendFiles = @("server.js", "package.json", "multipage-registration.html")
    foreach ($file in $frontendFiles) {
        $fullPath = "frontend\$file"
        if (Test-Path $fullPath) {
            "✅ $file exists" | Out-File -FilePath $outputFile -Append -Encoding UTF8
        } else {
            "❌ $file MISSING" | Out-File -FilePath $outputFile -Append -Encoding UTF8
        }
    }
    
    # Show multipage-registration.html structure (first 20 lines)
    if (Test-Path "frontend\multipage-registration.html") {
        @"

--- frontend/multipage-registration.html (first 20 lines) ---
"@ | Out-File -FilePath $outputFile -Append -Encoding UTF8
        Get-SafeContent "frontend\multipage-registration.html" 20 | Out-File -FilePath $outputFile -Append -Encoding UTF8
    }
    
    # Check if frontend has package.json
    if (Test-Path "frontend\package.json") {
        @"

--- frontend/package.json ---
"@ | Out-File -FilePath $outputFile -Append -Encoding UTF8
        Get-SafeContent "frontend\package.json" | Out-File -FilePath $outputFile -Append -Encoding UTF8
    }
    
    # Check if frontend has server.js  
    if (Test-Path "frontend\server.js") {
        @"

--- frontend/server.js (first 30 lines) ---
"@ | Out-File -FilePath $outputFile -Append -Encoding UTF8
        Get-SafeContent "frontend\server.js" 30 | Out-File -FilePath $outputFile -Append -Encoding UTF8
    }
} else {
    "❌ frontend/ directory does NOT exist!" | Out-File -FilePath $outputFile -Append -Encoding UTF8
}

Write-Host "✅ Analysis complete!"
Write-Host "📄 Results saved to: $outputFile"
Write-Host ""
Write-Host "Full path: $projectRoot\$outputFile"
