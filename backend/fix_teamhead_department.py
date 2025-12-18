import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.models import User
from services.models import Department

print("🔧 Updating teamhead@test.com with department...\n")

try:
    user = User.objects.get(email='teamhead@test.com')
    print(f"✅ Found user: {user.email}")
    print(f"   Current role: {user.role}")
    print(f"   Current department: {user.department}")
    
    if not user.department:
        dept = Department.objects.first()
        if dept:
            user.department = dept
            user.save()
            print(f"\n✅ Updated user with department: {dept.title}")
        else:
            print("\n❌ No department found in database!")
            print("Please create a department first.")
    else:
        print(f"\n✅ User already has department: {user.department.title}")
    
    print(f"\n🎉 User is ready!")
    print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"📧 Email: teamhead@test.com")
    print(f"🔑 Password: test123")
    print(f"👤 Role: {user.role}")
    if user.department:
        print(f"🏢 Department: {user.department.title}")
    print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    
except User.DoesNotExist:
    print("❌ User teamhead@test.com not found!")
    print("Please run setup_test_user.py first to create the user.")
