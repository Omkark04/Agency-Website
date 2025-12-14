import requests
import json

# Get the access token first
login_data = {
    "email": "teamhead@test.com",
    "password": "test123"
}

print("1. Logging in...")
response = requests.post("http://localhost:8000/auth/token/", json=login_data)
if response.status_code == 200:
    token = response.json()['access']
    print(f"✅ Login successful! Token: {token[:20]}...")
else:
    print(f"❌ Login failed: {response.status_code}")
    print(response.text)
    exit(1)

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

# Test 1: Add team member
print("\n2. Testing Add Team Member...")
member_data = {
    "username": "testmember",
    "email": "testmember@test.com"
}

response = requests.post("http://localhost:8000/auth/team-head/members/", 
                        json=member_data, 
                        headers=headers)
print(f"Status: {response.status_code}")
if response.status_code >= 400:
    print(f"❌ Error: {response.text}")
else:
    print(f"✅ Success: {response.json()}")

# Test 2: Update task status
print("\n3. Testing Update Task...")
# First get a task
response = requests.get("http://localhost:8000/auth/team-head/tasks/", headers=headers)
if response.status_code == 200:
    tasks = response.json()
    if tasks:
        task_id = tasks[0]['id']
        print(f"Found task ID: {task_id}")
        
        # Try to update just the status
        update_data = {
            "status": "in_progress"
        }
        
        response = requests.patch(f"http://localhost:8000/auth/team-head/tasks/{task_id}/",
                                 json=update_data,
                                 headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code >= 400:
            print(f"❌ Error: {response.text}")
        else:
            print(f"✅ Success: {response.json()}")
    else:
        print("No tasks found to update")
else:
    print(f"❌ Failed to get tasks: {response.text}")
