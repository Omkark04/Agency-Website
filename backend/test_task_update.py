import requests
import json

# Login
login_data = {"email": "teamhead@test.com", "password": "test123"}
response = requests.post("http://localhost:8000/auth/token/", json=login_data)
token = response.json()['access']

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

# Get task 7 details
print("Getting task 7 details...")
response = requests.get("http://localhost:8000/auth/team-head/tasks/7/", headers=headers)
print(f"Status: {response.status_code}")
if response.status_code == 200:
    task = response.json()
    print(f"Task: {json.dumps(task, indent=2)}")
    
    # Try to update just the status
    print("\nUpdating task status to 'in_progress'...")
    update_data = {"status": "in_progress"}
    response = requests.patch("http://localhost:8000/auth/team-head/tasks/7/",
                             json=update_data,
                             headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code >= 400:
        print(f"Error: {response.text}")
    else:
        print(f"Success: {json.dumps(response.json(), indent=2)}")
else:
    print(f"Error getting task: {response.text}")
