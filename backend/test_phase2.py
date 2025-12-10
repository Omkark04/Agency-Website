"""
Phase 2 Test Script
Tests notifications app functionality
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_phase2():
    print("=" * 50)
    print("PHASE 2 NOTIFICATIONS TEST")
    print("=" * 50)
    
    # Step 1: Login
    print("\n1. Logging in...")
    login_data = {
        "email": "test@example.com",
        "password": "TestPass123!"
    }
    response = requests.post(f"{BASE_URL}/auth/token/", json=login_data)
    if response.status_code == 200:
        token = response.json()["access"]
        print(f"✓ Login successful!")
        print(f"   Token: {token[:50]}...")
    else:
        print(f"✗ Login failed: {response.text}")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Step 2: List notifications
    print("\n2. Listing notifications...")
    response = requests.get(f"{BASE_URL}/api/notifications/", headers=headers)
    notifications = response.json()
    print(f"✓ Current notifications: {len(notifications)}")
    
    # Step 3: Create notification
    print("\n3. Creating notification...")
    notification_data = {
        "title": "Phase 2 Test",
        "message": "Testing notifications app!",
        "notification_type": "system"
    }
    response = requests.post(
        f"{BASE_URL}/api/notifications/",
        json=notification_data,
        headers=headers
    )
    if response.status_code == 201:
        notification = response.json()
        notification_id = notification["id"]
        print(f"✓ Created notification ID: {notification_id}")
        print(f"   Title: {notification['title']}")
        print(f"   Is Read: {notification['is_read']}")
    else:
        print(f"✗ Failed to create: {response.text}")
        return
    
    # Step 4: Get unread count
    print("\n4. Checking unread count...")
    response = requests.get(f"{BASE_URL}/api/notifications/unread_count/", headers=headers)
    unread_count = response.json()["unread_count"]
    print(f"✓ Unread notifications: {unread_count}")
    
    # Step 5: Mark as read
    print("\n5. Marking notification as read...")
    response = requests.post(
        f"{BASE_URL}/api/notifications/{notification_id}/mark_read/",
        headers=headers
    )
    if response.status_code == 200:
        marked = response.json()
        print(f"✓ Marked as read!")
        print(f"   Read at: {marked['read_at']}")
    else:
        print(f"✗ Failed to mark as read: {response.text}")
    
    # Step 6: Check unread count again
    print("\n6. Checking unread count again...")
    response = requests.get(f"{BASE_URL}/api/notifications/unread_count/", headers=headers)
    unread_count = response.json()["unread_count"]
    print(f"✓ Unread notifications: {unread_count}")
    
    print("\n" + "=" * 50)
    print("PHASE 2 TEST COMPLETE!")
    print("=" * 50)

if __name__ == "__main__":
    test_phase2()
