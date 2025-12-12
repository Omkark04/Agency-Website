# Test Authentication and Dashboard Access

## Quick Debug Steps

### Step 1: Check if you're logged in
Open browser console (F12) and run:
```javascript
console.log('Access Token:', localStorage.getItem('access'));
console.log('Role:', localStorage.getItem('role'));
```

### Step 2: If tokens are missing, login again
1. Go to http://localhost:5173
2. Click login button
3. Use credentials:
   - Email: teamhead@test.com
   - Password: test123
4. After login, check console again for tokens

### Step 3: After successful login
The app should automatically redirect you to `/team-head-dashboard`

### Step 4: If still redirecting to home
Check the useAuth hook - it might not be setting the role correctly.

---

## Alternative: Direct Login Test

Try logging in via the API directly to verify backend works:

```bash
# In PowerShell
$body = @{
    email = "teamhead@test.com"
    password = "test123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/auth/token/" -Method POST -Body $body -ContentType "application/json"
```

This should return:
- access token
- refresh token  
- user object with role: "service_head"

If this works, the backend is fine and the issue is in the frontend auth flow.
