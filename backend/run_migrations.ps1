# Migration Commands for Payment System

# Step 1: Create migrations for all new models
Write-Host "Creating migrations..." -ForegroundColor Yellow
python manage.py makemigrations payments
python manage.py makemigrations orders  
python manage.py makemigrations tasks

# Step 2: Show migration plan
Write-Host "`nShowing migration plan..." -ForegroundColor Yellow
python manage.py showmigrations

# Step 3: Apply migrations
Write-Host "`nApplying migrations..." -ForegroundColor Yellow
python manage.py migrate

Write-Host "`n✅ Migrations completed!" -ForegroundColor Green
Write-Host "`n📋 Next: Restart Django server to load new URLs" -ForegroundColor Cyan
