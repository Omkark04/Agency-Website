import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.models import User
from services.models import Service

print("🔧 Creating test user for Team Head Dashboard...\n")

# Get or create a service
service = Service.objects.first()
if not service:
    print("❌ No service found!")
    print("Please create a service first in Django admin or database.")
    exit(1)

print(f"✅ Found service: {service.title}")

# Create or update test user
email = 'teamhead@test.com'
password = 'test123'

try:
    user = User.objects.get(email=email)
    print(f"✅ User already exists: {email}")
except User.DoesNotExist:
    user = User.objects.create_user(
        username='teamhead_test',
        email=email,
        password=password,
        role='service_head',
        service=service
    )
    print(f"✅ Created new user: {email}")

# Update user to ensure correct settings
user.role = 'service_head'
user.service = service
user.set_password(password)
user.save()

print(f"\n🎉 Test user ready!")
print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
print(f"📧 Email: {email}")
print(f"🔑 Password: {password}")
print(f"👤 Role: {user.role}")
print(f"🏢 Service: {service.title}")
print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
print(f"\n✨ Now you can:")
print(f"1. Go to http://localhost:5173")
print(f"2. Login with the credentials above")
print(f"3. Navigate to Team Head Dashboard")
