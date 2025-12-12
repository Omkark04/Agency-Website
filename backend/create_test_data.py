# Create test data for team head dashboard
from accounts.models import User
from services.models import Service
from orders.models import Order
from tasks.models import Task

# Get or create a service
service = Service.objects.first()
if not service:
    print("❌ No service found! Please create a service first.")
    exit()

print(f"✅ Using service: {service.name}")

# Create team head user
try:
    user = User.objects.create_user(
        username='teamhead_test',
        email='teamhead@test.com',
        password='test123',
        role='service_head',
        service=service
    )
    print(f"✅ Created team head: {user.email}")
except Exception as e:
    user = User.objects.get(email='teamhead@test.com')
    user.role = 'service_head'
    user.service = service
    user.save()
    print(f"✅ Updated existing user: {user.email}")

# Create some test orders for this service
client = User.objects.filter(role='client').first()
if client:
    order = Order.objects.create(
        client=client,
        service=service,
        title='Test Project for Dashboard',
        details='Testing team head dashboard',
        price=1000,
        status='in_progress'
    )
    print(f"✅ Created order: {order.title}")
    
    # Create some tasks
    Task.objects.create(
        order=order,
        title='Design Homepage',
        status='completed',
        priority=3
    )
    Task.objects.create(
        order=order,
        title='Develop API',
        status='in_progress',
        priority=3
    )
    Task.objects.create(
        order=order,
        title='Review Code',
        status='review',
        priority=2
    )
    print("✅ Created 3 test tasks")
else:
    print("⚠️ No client found. Please create a client user first.")

print("\n🎉 Test data created! Login credentials:")
print("Email: teamhead@test.com")
print("Password: test123")
