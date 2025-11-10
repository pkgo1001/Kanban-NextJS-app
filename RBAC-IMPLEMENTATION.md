# 🔐 Role-Based Access Control (RBAC) Implementation Guide

## Overview

This document explains the Role-Based Access Control system implemented for the Kanban board application.

## 🎭 User Roles & Permissions

### Role Definitions

| Role | Permissions |
|------|------------|
| **ADMIN** | Full access - can create, edit, delete, assign, and move all tasks |
| **SUPERVISOR** | Can create, edit, delete, and assign tasks to team members |
| **EMPLOYEE** | Can only move tasks that are assigned to them |
| **VIEWER** | Read-only access - cannot modify anything |

## 📁 Files Created/Modified

### ✅ Completed Files

1. **`lib/permissions.ts`** - Core permissions logic
   - `canCreateTask()` - Check if user can create tasks
   - `canEditTask()` - Check if user can edit tasks
   - `canDeleteTask()` - Check if user can delete tasks
   - `canMoveTask()` - Check if user can move tasks (Employees restricted)
   - `canAssignTask()` - Check if user can assign tasks
   - `getUserPermissions()` - Get all permissions for a user

2. **`lib/auth.ts`** - Updated User interface
   - Added `role` field: `'ADMIN' | 'SUPERVISOR' | 'EMPLOYEE' | 'VIEWER'`
   - Added `assigneeId` field for linking users to assignees

3. **`lib/auth-helpers.ts`** - Authentication helpers
   - `getAuthenticatedUser()` - Extract user from request
   - `requireAuth()` - Enforce authentication

4. **`lib/hooks/usePermissions.ts`** - React hook for permissions
   - `usePermissions()` - Get permissions for current user
   - `useTaskPermissions()` - Get task-specific permissions

5. **`app/api/auth/login/route.ts`** - Updated to return role
   - Now returns `role` and `assigneeId` with user data

6. **`app/api/tasks/route.ts`** - Partially updated
   - Added permission check for task creation (ADMIN & SUPERVISOR only)

7. **`prisma/schema.prisma`** - Database schema
   - Added `Role` enum
   - Added `role` field to User model with default `EMPLOYEE`

## 🚧 Implementation Steps Needed

### 1. Complete API Route Protection

#### `/app/api/tasks/[id]/route.ts`

Add to the **PUT** handler (update task):

```typescript
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { canEditTask, canMoveTask } from '@/lib/permissions';

export async function PUT(request: NextRequest, { params }: RouteParams) {
  // Get authenticated user
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  // Get the existing task
  const existingTask = await prisma.task.findUnique({
    where: { id: params.id }
  });

  if (!existingTask) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const taskData = await request.json();

  // Check if this is a status change (move operation)
  const isStatusChange = taskData.status !== undefined && 
                         taskData.status !== existingTask.status;

  if (isStatusChange) {
    // Check move permission (Employees can only move their own tasks)
    const canMove = canMoveTask({
      userRole: user.role,
      userId: user.id,
      userAssigneeId: user.assigneeId,
      taskAssigneeId: existingTask.assigneeId
    });

    if (!canMove) {
      return NextResponse.json({
        error: 'You can only move tasks assigned to you'
      }, { status: 403 });
    }
  } else {
    // Check edit permission (for other changes)
    const canEdit = canEditTask({
      userRole: user.role,
      userId: user.id,
      taskOwnerId: existingTask.ownerId,
      taskAssigneeId: existingTask.assigneeId,
      userAssigneeId: user.assigneeId
    });

    if (!canEdit) {
      return NextResponse.json({
        error: 'You do not have permission to edit this task'
      }, { status: 403 });
    }
  }

  // Continue with update...
}
```

Add to the **DELETE** handler:

```typescript
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  // Get the existing task
  const existingTask = await prisma.task.findUnique({
    where: { id: params.id }
  });

  if (!existingTask) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  // Check delete permission
  const canDelete = canDeleteTask({
    userRole: user.role,
    userId: user.id,
    taskOwnerId: existingTask.ownerId,
    taskAssigneeId: existingTask.assigneeId,
    userAssigneeId: user.assigneeId
  });

  if (!canDelete) {
    return NextResponse.json({
      error: 'You do not have permission to delete this task'
    }, { status: 403 });
  }

  // Continue with delete...
}
```

### 2. Update Frontend Components

#### `/components/kanban-board.tsx`

Update to use permissions hook:

```typescript
import { usePermissions } from '@/lib/hooks/usePermissions';

export function KanbanBoard() {
  const { user } = useAuth();
  const permissions = usePermissions();

  // Disable drag & drop for Viewers
  const handleDragEnd = (event: DragEndEvent) => {
    if (!permissions.canMove) {
      toast.error('You do not have permission to move tasks');
      return;
    }
    // Continue with drag logic...
  };

  return (
    <div>
      {/* Show Add Task button only for ADMIN/SUPERVISOR */}
      {permissions.canCreate && (
        <Button onClick={openAddTaskDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      )}

      {/* Role badge */}
      <Badge variant="outline">
        {permissions.roleDescription}
      </Badge>

      {/* Kanban columns */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        {/* ... columns ... */}
      </DndContext>
    </div>
  );
}
```

#### `/components/task-card.tsx`

Update to show/hide actions based on permissions:

```typescript
import { useTaskPermissions } from '@/lib/hooks/usePermissions';

export function TaskCard({ task }: { task: Task }) {
  const permissions = useTaskPermissions(task.id, {
    id: task.id,
    ownerId: task.ownerId,
    assigneeId: task.assigneeId
  });

  return (
    <Card className={permissions.isReadOnly ? 'opacity-75' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{task.title}</CardTitle>
          
          {/* Show actions only if user has permissions */}
          <div className="flex items-center gap-2">
            {permissions.showEditButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(task)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            
            {permissions.showDeleteButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(task.id)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Show read-only badge for Viewers */}
      {permissions.isReadOnly && (
        <Badge variant="secondary">Read Only</Badge>
      )}
    </Card>
  );
}
```

### 3. Update API Calls to Include Auth Token

#### Add token to fetch requests

Update all API calls in frontend to include the auth token:

```typescript
// Example in kanban-board.tsx
const createTask = async (taskData: Task) => {
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // Add this header
    },
    body: JSON.stringify(taskData)
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 403) {
      toast.error(error.error || 'Permission denied');
      return;
    }
    throw new Error(error.error);
  }

  return response.json();
};
```

### 4. Update Edit/Add Task Dialogs

#### `/components/edit-task-dialog.tsx` & `/components/add-task-dialog.tsx`

Disable fields based on permissions:

```typescript
import { usePermissions } from '@/lib/hooks/usePermissions';

export function EditTaskDialog({ task }: { task: Task }) {
  const permissions = usePermissions(task);

  return (
    <Dialog>
      <DialogContent>
        {/* Title field */}
        <Input
          disabled={!permissions.canEdit}
          {...register('title')}
        />

        {/* Assignee field */}
        <Select
          disabled={!permissions.canAssign}
          {...register('assignee')}
        >
          {/* Options */}
        </Select>

        {/* Priority field */}
        <Select
          disabled={!permissions.canChangePriority}
          {...register('priority')}
        >
          {/* Options */}
        </Select>

        {/* Due date field */}
        <Input
          type="date"
          disabled={!permissions.canChangeDueDate}
          {...register('dueDate')}
        />

        {/* Show permission message */}
        {!permissions.canEdit && (
          <Alert>
            <AlertDescription>
              You only have permission to view this task
            </AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

## 🎯 Permission Matrix

| Action | ADMIN | SUPERVISOR | EMPLOYEE | VIEWER |
|--------|-------|-----------|----------|--------|
| View tasks | ✅ | ✅ | ✅ | ✅ |
| Create task | ✅ | ✅ | ❌ | ❌ |
| Edit any task | ✅ | ✅ | ❌ | ❌ |
| Delete any task | ✅ | ✅ | ❌ | ❌ |
| Assign tasks | ✅ | ✅ | ❌ | ❌ |
| Move any task | ✅ | ✅ | ❌ | ❌ |
| Move own task | ✅ | ✅ | ✅ | ❌ |
| Change priority | ✅ | ✅ | ❌ | ❌ |
| Change due date | ✅ | ✅ | ❌ | ❌ |
| Manage tags | ✅ | ✅ | ❌ | ❌ |

## 🧪 Testing the Implementation

### Test Scenarios

1. **As ADMIN** (e.g., emma.davis@company.com)
   - Should be able to do everything
   - Create, edit, delete, assign, move all tasks

2. **As SUPERVISOR** (e.g., lisa.thompson@company.com)
   - Should be able to create, edit, delete, assign tasks
   - Cannot delete tasks they don't own (if you want this restriction)

3. **As EMPLOYEE** (e.g., david.park@company.com)
   - Cannot see "Add Task" button
   - Cannot edit or delete any tasks
   - Can only move tasks assigned to them
   - Other users' tasks should be locked

4. **As VIEWER** (e.g., alex.rodriguez@company.com)
   - Cannot see "Add Task" button
   - Cannot edit, delete, or move any tasks
   - Everything is read-only
   - Should see "Read Only" badges

### Test User Accounts

Based on your current database:

| User | Email | Role | Use For Testing |
|------|-------|------|-----------------|
| Emma Davis | emma.davis@company.com | ADMIN | Full access testing |
| Lisa Thompson | lisa.thompson@company.com | SUPERVISOR | Management testing |
| David Park | david.park@company.com | EMPLOYEE | Limited access testing |
| Alex Rodriguez | alex.rodriguez@company.com | VIEWER | Read-only testing |

## 🔒 Security Considerations

1. **Always validate on the backend** - Frontend checks are for UX only
2. **Check permissions on every API route**
3. **Validate user identity** - Replace temp token with JWT
4. **Log permission denials** - For audit trail
5. **Rate limiting** - Prevent abuse
6. **Input validation** - Sanitize all inputs

## 📝 Next Steps

1. Complete the API route protection for PUT and DELETE
2. Update all frontend components to use `usePermissions` hook
3. Add auth token to all fetch requests
4. Test with different user roles
5. Add visual indicators (badges, disabled states, tooltips)
6. Implement proper JWT authentication (replace temp token)
7. Add audit logging for sensitive operations

## 🎨 UI Recommendations

1. **Visual Feedback**
   - Show role badge in header
   - Disable/hide buttons user can't use
   - Add tooltips explaining why actions are disabled
   - Use opacity or different styling for read-only items

2. **Error Messages**
   - Clear messages for permission denials
   - Suggest who to contact (e.g., "Contact your supervisor")
   - Show current role in error messages

3. **Loading States**
   - Show loading while checking permissions
   - Disable actions during permission checks

## 🐛 Troubleshooting

**Problem**: Permissions not working
- Check if user role is returned from login API
- Verify localStorage has auth_token
- Check browser console for errors
- Verify permissions.ts logic

**Problem**: Employees can't move their tasks
- Verify user has `assigneeId` set
- Check if task's `assigneeId` matches user's `assigneeId`
- Add console.logs to debug permission check

**Problem**: API returns 401
- Check if Authorization header is sent
- Verify token format (Bearer token_value)
- Check if token extraction works in auth-helpers.ts

---

**Implementation Status**: ⚠️ **Partially Complete**  
**Core Files**: ✅ Created  
**API Protection**: 🔄 In Progress  
**Frontend UI**: 🔄 Needs Update


