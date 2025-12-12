# Quick Test Guide for Team Head Dashboard

## Fastest Way to Test (Using Django Admin)

### Step 1: Open Django Admin
1. Go to: http://localhost:8000/admin
2. Login with your admin credentials

### Step 2: Modify Your Admin User
1. Click on "Users" 
2. Find your admin user
3. Change these fields:
   - Role: Select "service_head" 
   - Service: Select any service from dropdown
4. Click "Save"

### Step 3: Test the Frontend
1. Go to: http://localhost:5173 (or your Vite port)
2. Login with your admin credentials
3. Navigate to Team Head Dashboard
4. You should see:
   ✅ Real statistics (not zeros)
   ✅ Projects list
   ✅ Tasks list
   ✅ Team members
   ✅ Recent activity

### Step 4: Check Browser Console
1. Press F12 to open DevTools
2. Go to "Network" tab
3. Look for calls to `/auth/team-head/stats/`
4. Check if they return status 200 (success)

---

## What to Look For

### ✅ Success Signs:
- Dashboard loads without errors
- Statistics show real numbers
- No red error messages
- Network tab shows successful API calls (200 status)

### ❌ Error Signs:
- "Failed to load dashboard data" message
- All statistics show 0
- 401 Unauthorized in Network tab
- "Team head must be assigned to a service" error

---

## If You See Errors:

### Error: "Team head must be assigned to a service"
**Fix:** Go back to Django admin and assign a service to your user

### Error: 401 Unauthorized
**Fix:** Make sure you're logged in and the token is valid

### Error: All stats show 0
**Fix:** Create some test data:
1. Go to Django admin
2. Create an Order with your service
3. Create some Tasks for that order

---

## Quick Data Check

To verify data exists, check Django admin:
- **Services** → Should have at least 1 service
- **Orders** → Should have at least 1 order
- **Tasks** → Should have some tasks assigned to orders

---

## Next Steps After Testing

Once you confirm the APIs work:
1. We'll fix TypeScript errors in the frontend
2. Connect team member management UI
3. Add task filtering controls
