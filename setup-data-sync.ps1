#!/usr/bin/env pwsh
# Setup Data Sync Repository
# This script clones boston-trip-data, adds master JSON files, and pushes to GitHub

param(
    [Parameter(Mandatory=$true)]
    [string]$DataRepoUrl = "https://github.com/temprano/boston-trip-data.git"
)

$ErrorActionPreference = "Stop"

# Create temp directory
$tempDir = "$env:TEMP\boston-trip-data-setup"
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
New-Item -ItemType Directory -Path $tempDir | Out-Null

Write-Host "📁 Setting up data sync repository..." -ForegroundColor Cyan
cd $tempDir

# Clone the repo
Write-Host "📥 Cloning repository..." -ForegroundColor Blue
git clone $DataRepoUrl . 2>&1

# Create .versions folder
New-Item -ItemType Directory -Path ".versions" -Force | Out-Null

# Create version files with current timestamp
$timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
@{timestamp = $timestamp} | ConvertTo-Json | Out-File ".versions/boston_events.version" -Encoding UTF8
@{timestamp = $timestamp} | ConvertTo-Json | Out-File ".versions/boston_travelers.version" -Encoding UTF8

Write-Host "✅ Version files created:" -ForegroundColor Green
Write-Host "   - .versions/boston_events.version"
Write-Host "   - .versions/boston_travelers.version"

# Instructions
Write-Host "`n📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Manually add these files to the repository via GitHub UI:"
Write-Host "   - boston_events.json (from public/assets/events-v1.json)"
Write-Host "   - boston_travelers.json (from public/assets/localstore-v1.json)"
Write-Host "`n2. Or push from command line:"
Write-Host "   git add ."
Write-Host "   git commit -m 'Add initial event and traveler data'"
Write-Host "   git push"
Write-Host "`nRepository ready at: $tempDir"
