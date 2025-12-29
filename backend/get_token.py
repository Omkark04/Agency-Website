import requests

print("1. Go to this URL to get a NEW code:")
print("https://www.dropbox.com/oauth2/authorize?client_id=dlwziolxnyxllt8&token_access_type=offline&response_type=code")
print("-" * 50)

code = input("Enter the new access code from the browser: ").strip()

url = "https://api.dropbox.com/oauth2/token"
data = {
    'code': code,
    'grant_type': 'authorization_code',
    'client_id': 'dlwziolxnyxllt8',
    'client_secret': 'r4n2k9dej0khbal'
}

print("-" * 50)
print("Exchanging code for token...")

try:
    response = requests.post(url, data=data)
    print("Status Code:", response.status_code)
    print("Response:", response.text)
    
    if response.status_code == 200:
        print("-" * 50)
        print("SUCCESS! Copy the 'refresh_token' below and put it in your .env file:")
        import json
        print(response.json().get('refresh_token'))
except Exception as e:
    print("Error:", e)
