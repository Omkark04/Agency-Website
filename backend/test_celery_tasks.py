# test_celery_tasks.py
"""
Test script for Celery background tasks
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from notifications.tasks import (
    send_email_notification,
    create_notification_task,
    send_notification_with_email
)

def test_celery():
    print("=" * 50)
    print("TESTING CELERY BACKGROUND TASKS")
    print("=" * 50)
    
    # Test 1: Create notification async
    print("\n1. Creating notification in background...")
    result1 = create_notification_task.delay(
        user_id=3,  # Test user ID
        title="Celery Test Notification",
        message="This notification was created by a background worker!",
        notification_type="system"
    )
    print(f"✓ Task submitted: {result1.id}")
    print(f"  Status: {result1.status}")
    
    # Test 2: Send notification with email (email disabled for testing)
    print("\n2. Creating notification with email option...")
    result2 = send_notification_with_email.delay(
        user_id=3,
        title="Background Worker Test",
        message="Testing Celery background tasks!",
        notification_type="system",
        send_email=False  # Set to True to actually send email
    )
    print(f"✓ Task submitted: {result2.id}")
    print(f"  Status: {result2.status}")
    
    print("\n" + "=" * 50)
    print("TASKS SUBMITTED TO CELERY WORKER")
    print("=" * 50)
    print("\nCheck the Celery worker terminal to see task execution!")
    print("Tasks will be processed in the background.")
    print("\nTo check results:")
    print("  1. Look at Celery worker logs")
    print("  2. Check notifications in API: http://localhost:8000/api/notifications/")

if __name__ == "__main__":
    test_celery()
