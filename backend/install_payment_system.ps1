# Installation and Setup Script for Payment System
# Run this script to install all required dependencies

Write-Host "Installing Payment System Dependencies..." -ForegroundColor Green

# Install Python packages
Write-Host "`nInstalling Python packages..." -ForegroundColor Yellow
pip install razorpay==1.4.1
pip install paypalrestsdk==1.13.1  
pip install weasyprint==60.1

Write-Host "`n✅ Dependencies installed successfully!" -ForegroundColor Green

Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update your .env file with payment gateway credentials"
Write-Host "2. Run migrations: python manage.py makemigrations"
Write-Host "3. Run migrations: python manage.py migrate"
Write-Host "4. Restart Django server"
Write-Host "`nSee .env.payment_system for configuration template"
