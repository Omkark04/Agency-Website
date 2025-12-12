import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from orders.models import Order
from accounts.models import User
from services.models import Service

# Get the team head user and their service
user = User.objects.get(email='teamhead@test.com')
service = user.service

print(f"Team head: {user.username}")
print(f"Service: {service.title}")

# Get a client user
client = User.objects.filter(role='client').first()
if not client:
    print("No client found! Creating one...")
    client = User.objects.create_user(
        username='test_client',
        email='client@test.com',
        password='test123',
        role='client'
    )
    print(f"Created client: {client.username}")
else:
    print(f"Using existing client: {client.username}")

# Create test orders
orders_created = []
for i in range(1, 4):
    order = Order.objects.create(
        client=client,
        service=service,
        title=f'Test Project {i}',
        details=f'Testing project {i} for task management',
        price=1000 * i,
        status='in_progress'
    )
    orders_created.append(order)
    print(f"✅ Created order: {order.title} (ID: {order.id})")

print(f"\n🎉 Created {len(orders_created)} orders!")
print(f"You can now create tasks for these projects.")
