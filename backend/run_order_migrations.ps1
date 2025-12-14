# Run this script to create and apply migrations for new Order fields
# PowerShell script

Write-Host "Creating migrations for Order model updates..." -ForegroundColor Green

# Activate virtual environment if it exists
if (Test-Path "venv\Scripts\Activate.ps1") {
    & venv\Scripts\Activate.ps1
}

# Create migrations
& py manage.py makemigrations orders

# Apply migrations
& py manage.py migrate orders

Write-Host "Migrations completed!" -ForegroundColor Green
Write-Host ""
Write-Host "New fields added to Order model:" -ForegroundColor Cyan
Write-Host "  - whatsapp_number" -ForegroundColor Yellow
Write-Host "  - price_card_title" -ForegroundColor Yellow
Write-Host "  - price_card_price" -ForegroundColor Yellow
Write-Host "  - form_submission (ForeignKey)" -ForegroundColor Yellow
Write-Host "  - total_paid (for partial payments)" -ForegroundColor Yellow
