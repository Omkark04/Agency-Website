import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from services.models import Service, Department
from orders.models import Order
from tasks.models import Task
from datetime import date, timedelta

User = get_user_model()

print("🚀 Creating comprehensive test data for Team Head Dashboard...\n")

# Step 1: Create Department
print("1️⃣ Creating Department...")
department, created = Department.objects.get_or_create(
    title="Design",
    defaults={
        'short_description': 'Creative design services'
    }
)
print(f"   {'✅ Created' if created else '✅ Found'} department: {department.title}")

# Step 2: Create Service
print("\n2️⃣ Creating Service...")
service, created = Service.objects.get_or_create(
    title="Logo Design",
    defaults={
        'department': department,
        'short_description': 'Professional logo design services',
        'long_description': 'We create stunning logos for your brand'
    }
)
print(f"   {'✅ Created' if created else '✅ Found'} service: {service.title}")

# Step 3: Create Team Head User
print("\n3️⃣ Creating Team Head User...")
try:
    team_head = User.objects.get(email='teamhead@test.com')
    team_head.role = 'service_head'
    team_head.service = service
    team_head.set_password('test123')
    team_head.save()
    print(f"   ✅ Updated existing user: {team_head.email}")
except User.DoesNotExist:
    team_head = User.objects.create_user(
        username='teamhead_test',
        email='teamhead@test.com',
        password='test123',
        role='service_head',
        service=service
    )
    print(f"   ✅ Created new user: {team_head.email}")

# Step 4: Create Client User
print("\n4️⃣ Creating Client User...")
try:
    client = User.objects.get(email='client@test.com')
    print(f"   ✅ Found existing client: {client.email}")
except User.DoesNotExist:
    client = User.objects.create_user(
        username='client_test',
        email='client@test.com',
        password='test123',
        role='client'
    )
    print(f"   ✅ Created new client: {client.email}")

# Step 5: Create Team Members
print("\n5️⃣ Creating Team Members...")
team_members = []
for i in range(1, 4):
    try:
        member = User.objects.get(email=f'member{i}@test.com')
        member.service = service
        member.role = 'team_member'
        member.save()
        print(f"   ✅ Updated team member: {member.email}")
    except User.DoesNotExist:
        member = User.objects.create_user(
            username=f'member{i}',
            email=f'member{i}@test.com',
            password='test123',
            role='team_member',
            service=service
        )
        print(f"   ✅ Created team member: {member.email}")
    team_members.append(member)

# Step 6: Create Orders
print("\n6️⃣ Creating Orders...")
orders = []
order_data = [
    {
        'title': 'Brand Logo Design',
        'details': 'Create a modern logo for tech startup',
        'price': 1500,
        'status': 'in_progress',
        'progress': 45
    },
    {
        'title': 'Restaurant Logo',
        'details': 'Design logo for Italian restaurant',
        'price': 1200,
        'status': 'in_progress',
        'progress': 60
    },
    {
        'title': 'E-commerce Logo',
        'details': 'Logo for online store',
        'price': 1000,
        'status': 'pending',
        'progress': 10
    }
]

for data in order_data:
    order, created = Order.objects.get_or_create(
        client=client,
        service=service,
        title=data['title'],
        defaults={
            'details': data['details'],
            'price': data['price'],
            'status': data['status'],
            'progress': data['progress'],
            'client_email': client.email,
            'due_date': date.today() + timedelta(days=14)
        }
    )
    orders.append(order)
    print(f"   {'✅ Created' if created else '✅ Found'} order: {order.title}")

# Step 7: Create Tasks
print("\n7️⃣ Creating Tasks...")
task_data = [
    # Order 1 tasks
    {'order': 0, 'title': 'Research brand identity', 'status': 'completed', 'priority': 2, 'assignee': 0},
    {'order': 0, 'title': 'Create initial concepts', 'status': 'completed', 'priority': 3, 'assignee': 0},
    {'order': 0, 'title': 'Client review meeting', 'status': 'in_progress', 'priority': 3, 'assignee': 1},
    {'order': 0, 'title': 'Finalize design', 'status': 'todo', 'priority': 2, 'assignee': None},
    
    # Order 2 tasks
    {'order': 1, 'title': 'Understand restaurant theme', 'status': 'completed', 'priority': 2, 'assignee': 1},
    {'order': 1, 'title': 'Design logo variations', 'status': 'in_progress', 'priority': 3, 'assignee': 1},
    {'order': 1, 'title': 'Get feedback', 'status': 'review', 'priority': 2, 'assignee': 2},
    
    # Order 3 tasks
    {'order': 2, 'title': 'Analyze competitors', 'status': 'todo', 'priority': 1, 'assignee': None},
    {'order': 2, 'title': 'Create mood board', 'status': 'todo', 'priority': 2, 'assignee': 2},
]

task_count = 0
for data in task_data:
    assignee = team_members[data['assignee']] if data['assignee'] is not None else None
    task, created = Task.objects.get_or_create(
        order=orders[data['order']],
        title=data['title'],
        defaults={
            'description': f"Task for {orders[data['order']].title}",
            'status': data['status'],
            'priority': data['priority'],
            'assignee': assignee,
            'due_date': date.today() + timedelta(days=7)
        }
    )
    if created:
        task_count += 1

print(f"   ✅ Created {task_count} tasks")

# Summary
print("\n" + "="*50)
print("🎉 TEST DATA CREATED SUCCESSFULLY!")
print("="*50)
print("\n📋 Summary:")
print(f"   • Department: {department.title}")
print(f"   • Service: {service.title}")
print(f"   • Team Head: {team_head.email}")
print(f"   • Client: {client.email}")
print(f"   • Team Members: {len(team_members)}")
print(f"   • Orders: {len(orders)}")
print(f"   • Tasks: {Task.objects.count()}")

print("\n🔐 Login Credentials:")
print("   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
print("   📧 Email: teamhead@test.com")
print("   🔑 Password: test123")
print("   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

print("\n✨ Next Steps:")
print("   1. Start Django server: python manage.py runserver")
print("   2. Go to: http://localhost:5173")
print("   3. Login with credentials above")
print("   4. Test Team Head Dashboard features!")
print()
