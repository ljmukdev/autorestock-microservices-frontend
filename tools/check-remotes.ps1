# -------------------------------------------------------------------
# File: check-remotes.ps1
# Location: tools/check-remotes.ps1
# -------------------------------------------------------------------
param([string[]]$Services = @("settings-service","ebay-service","vinted-service","sales-service"))

foreach ($svc in $Services) {
  $p = "microservices\$svc"
  if (Test-Path $p) {
    Write-Host "`n== $p ==" -ForegroundColor Cyan
    Push-Location $p
    if (Test-Path ".git") {
      git remote -v
      git branch --show-current
      git status -s
    } else {
      Write-Host "(no git repo yet)"
    }
    Pop-Location
  }
}
