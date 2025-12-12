# Task Editing Implementation Plan

## Current State
- ✅ TaskManager component exists with full UI
- ✅ Drag-and-drop Kanban board
- ✅ Add task modal
- ❌ Using mock data
- ❌ Edit button has no functionality
- ❌ Not connected to backend

## What Needs to Be Done

### 1. Connect to Backend APIs
- Fetch tasks from `/auth/team-head/tasks/`
- Update task status when dragged
- Create new tasks
- Edit existing tasks
- Delete tasks

### 2. Add Edit Modal
- Similar to Add Task modal
- Pre-fill with existing task data
- Update task on submit

### 3. Fix Data Structure Mismatch
Backend returns:
```json
{
  "id": 1,
  "title": "Task Title",
  "description": "Description",
  "status": "in_progress",  // Note: underscore
  "priority": "High",       // Note: capitalized
  "due_date": "2025-12-15", // Note: underscore
  "assignee": {
    "id": 5,
    "name": "John Doe"
  }
}
```

Frontend expects:
```typescript
{
  id: string,
  title: string,
  description: string,
  status: 'todo' | 'in-progress' | 'review' | 'done',
  priority: 'low' | 'medium' | 'high',
  dueDate: string,  // camelCase
  assignee: string, // just name
  tags: string[]
}
```

### 4. Implementation Steps

1. **Add Edit State & Modal** (5 min)
   - Add `isEditTaskOpen` state
   - Add `editingTask` state
   - Create edit modal (copy add modal)

2. **Connect to Backend** (10 min)
   - Import `getTeamTasks` from API
   - Fetch tasks on component mount
   - Transform API data to match frontend format

3. **Implement Edit** (5 min)
   - Wire up edit button
   - Open modal with task data
   - Submit update to backend

4. **Implement Drag-and-Drop Update** (5 min)
   - Call backend API when status changes
   - Update local state on success

5. **Implement Create** (5 min)
   - Call backend API on add task
   - Add to local state on success

6. **Implement Delete** (3 min)
   - Call backend API on delete
   - Remove from local state on success

## Quick Fix Option

Since the backend doesn't have task create/update/delete endpoints yet, we have two options:

### Option A: Use Existing Task ViewSet
The backend has a `TaskViewSet` at `/api/tasks/` that supports CRUD. We can:
- Use it for create/update/delete
- Filter by service in the frontend

### Option B: Add Team Head Task Endpoints
Create new endpoints specifically for team heads:
- `POST /auth/team-head/tasks/` - Create task
- `PATCH /auth/team-head/tasks/<id>/` - Update task  
- `DELETE /auth/team-head/tasks/<id>/` - Delete task

**Recommendation: Option A** (faster, uses existing backend)

## Next Steps

1. Which option do you prefer?
2. Should I implement the full solution or just the edit functionality first?
