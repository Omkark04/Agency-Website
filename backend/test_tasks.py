import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from tasks.models import Task
from orders.models import Order

User = get_user_model()

# Get the team head user
user = User.objects.filter(email='teamhead@test.com').first()
print(f"User: {user.email}")
print(f"Role: {user.role}")
print(f"Service: {user.service}")

if user and user.service:
    # Get tasks for this service
    tasks = Task.objects.filter(order__service=user.service).select_related('assignee', 'order')
    print(f"\nTotal tasks for {user.service.title}: {tasks.count()}")
    
    if tasks.exists():
        for task in tasks[:3]:  # Show first 3 tasks
            print(f"\nTask ID: {task.id}")
            print(f"  Title: {task.title}")
            print(f"  Status: {task.status}")
            print(f"  Priority: {task.priority}")
            print(f"  Priority Display: {task.get_priority_display()}")
            print(f"  Assignee: {task.assignee.username if task.assignee else 'Unassigned'}")
            print(f"  Order: {task.order.title}")
            
            # Test avatar_url
            if task.assignee:
                print(f"  Has avatar_url attr: {hasattr(task.assignee, 'avatar_url')}")
                if hasattr(task.assignee, 'avatar_url'):
                    print(f"  Avatar URL: {task.assignee.avatar_url}")
    else:
        print("\nNo tasks found for this service!")
        print("\nLet's check all orders for this service:")
        orders = Order.objects.filter(service=user.service)
        print(f"Orders for {user.service.title}: {orders.count()}")
        for order in orders[:3]:
            print(f"  - {order.title} (ID: {order.id})")
else:
    print("\nUser has no service assigned!")
