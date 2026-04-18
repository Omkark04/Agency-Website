import os
import sys

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
import django
django.setup()

from services.models import Department, Service

print("--- DEPARTMENTS ---")
for d in Department.objects.all():
    print(f"ID: {d.id}, Title: {d.title}, Slug: {d.slug}, Logo: {d.logo}")

print("\n--- SERVICES ---")
for s in Service.objects.all():
    print(f"ID: {s.id}, Title: {s.title}, Dept: {s.department.title}")
