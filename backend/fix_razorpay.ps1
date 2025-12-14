# Fix for Razorpay pkg_resources error
# Razorpay requires setuptools which provides pkg_resources

Write-Host "Installing missing dependency: setuptools..." -ForegroundColor Yellow
pip install setuptools

Write-Host "`n✅ Setuptools installed!" -ForegroundColor Green
Write-Host "`nNow run: python manage.py makemigrations" -ForegroundColor Cyan
