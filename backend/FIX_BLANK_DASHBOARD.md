# Quick Fix for Team Head Dashboard Blank Screen

## The Problem
The dashboard shows blank because:
1. TypeScript errors are crashing the component
2. The loading/error states aren't being used properly

## Quick Manual Fix

### Option 1: Add Console Logs to Debug (Do this first)

Open browser console (F12) and check for errors. You'll probably see something like:
- "Cannot read property 'map' of undefined"
- "stats.map is not a function"

### Option 2: Temporary Workaround

Add this at the very top of the component's return statement (around line 138):

```tsx
// Add this right after: return (
if (isLoading) {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
      </div>
    </div>
  );
}

if (error) {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center max-w-md">
        <FiAlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Dashboard</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

if (!stats) {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <p className="text-gray-600 dark:text-gray-400">No data available</p>
    </div>
  );
}
```

## What to Check in Console

Run these in browser console:
```javascript
// Check if API is being called
console.log('Checking API...');

// Check what data is returned
fetch('http://localhost:8000/auth/team-head/stats/', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('access')
  }
})
.then(r => r.json())
.then(data => console.log('Stats data:', data))
.catch(err => console.error('API Error:', err));
```

This will show if the backend is returning data correctly.
