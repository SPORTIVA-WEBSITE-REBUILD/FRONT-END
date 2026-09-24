# PowerShell helper script for PCN Sportiva front-end
# Usage: .\run_all.ps1
# This script will:
# 1. Install npm dependencies
# 2. Start the development server (press Ctrl+C to stop)
# 3. After you stop the dev server, it will build the production bundle
# 4. Run the test suite

# Exit on any error
$ErrorActionPreference = "Stop"

Write-Host "Installing npm dependencies..."
npm install

Write-Host "Starting development server..."
npm run dev

# When you stop the dev server (Ctrl+C), the script continues
Write-Host "Development server stopped. Building production bundle..."
npm run build

Write-Host "Running test suite..."
npm test

Write-Host "All done."

