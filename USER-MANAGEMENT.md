# 👥 User Management System

Comprehensive user management interface for Admins to manage all system users, roles, and permissions.

---

## 🎯 Overview

The User Management system provides a complete administrative interface for managing user accounts, roles, and access control in the Kanban application. **Only users with the ADMIN role** can access and use these features.

---

## 🚀 Quick Start

### Access User Management

1. **Login as an Admin**
   - Use one of the admin accounts (e.g., `admin.dev@company.com` / `admin123`)

2. **Navigate to User Management**
   - Click the **"User Management"** button in the Kanban board header
   - Or visit directly: `http://localhost:3000/users`

3. **Auto-redirect for Non-Admins**
   - If you're not an Admin, you'll be automatically redirected to the home page

---

## ✨ Features

### 1. 📋 View All Users

**Table Columns:**
- **Name** - User's full name and job role
- **Email** - User's email address
- **Role** - System role with color-coded badges:
  - 🔴 **ADMIN** - Red badge
  - 🔵 **SUPERVISOR** - Blue badge
  - 🟢 **EMPLOYEE** - Green badge
  - ⚪ **VIEWER** - Gray badge
- **Department** - User's department (from assignee profile)
- **Status** - Email verification status (Verified/Pending)
- **Actions** - Edit, Reset Password, Delete buttons

**Features:**
- Real-time user count display
- Sortable by creation date (newest first)
- Responsive table design
- Hover highlighting

---

### 2. ➕ Create New User

**Click "Add User"** button to open the creation dialog.

**Required Fields:**
- **Email** - Must be unique
- **Full Name** - User's display name
- **Password** - Minimum 6 characters
- **Role** - Select from ADMIN, SUPERVISOR, EMPLOYEE, or VIEWER

**Optional Fields (Assignee Profile):**
- **Assignee Name** - Name for task assignment
- **Department** - e.g., "Engineering", "Marketing"
- **Job Role** - e.g., "Developer", "Designer"

**What Happens:**
1. User account is created with hashed password
2. Email is marked as verified
3. If assignee details provided, an assignee profile is created
4. User is linked to assignee profile for task assignments
5. Table refreshes automatically

**Example:**
```json
{
  "email": "john.doe@company.com",
  "name": "John Doe",
  "password": "securepass123",
  "role": "EMPLOYEE",
  "assigneeName": "John Doe",
  "assigneeDepartment": "Engineering",
  "assigneeRole": "Frontend Developer"
}
```

---

### 3. ✏️ Edit User

**Click the Edit (pencil) icon** to modify user details.

**Editable Fields:**
- **Full Name** - Update user's name
- **Email** - Change email (must be unique)
- **Role** - Change user's system role

**Restrictions:**
- Cannot edit password here (use Reset Password)
- Changes take effect immediately
- Email uniqueness is enforced

**Use Cases:**
- Promote EMPLOYEE to SUPERVISOR
- Update user information
- Correct email addresses
- Change department assignments

---

### 4. 🔑 Reset Password

**Click the Key icon** to reset a user's password.

**Process:**
1. Enter new password (minimum 6 characters)
2. Confirm password (must match)
3. Password is securely hashed using bcrypt
4. User can login with new password immediately

**Security Features:**
- Password strength validation
- Confirmation to prevent typos
- Secure bcrypt hashing (10 rounds)
- No plaintext password storage
- Admin action logging

**Best Practices:**
- Use strong passwords (12+ characters recommended)
- Include mix of letters, numbers, symbols
- Inform user of password change
- Consider implementing password reset emails

---

### 5. 🗑️ Delete User

**Click the Trash icon** to remove a user.

**Confirmation Dialog:**
- Shows user's name
- Warns about irreversibility
- Requires explicit confirmation

**What Happens:**
1. User account is permanently deleted
2. Associated assignee profile may be deleted
3. Tasks owned by user remain (owner set to null)
4. Tasks assigned to user are unaffected (can be reassigned)
5. Table refreshes automatically

**Protections:**
- ✅ Admins **cannot delete themselves**
- ✅ Confirmation dialog prevents accidents
- ✅ API prevents self-deletion attempts
- ⚠️ Action is **irreversible**

**When to Delete:**
- User has left the organization
- Duplicate accounts
- Test accounts cleanup
- Security breach containment

---

## 🔐 Security & Permissions

### Access Control

**Admin Only:**
- All user management features require ADMIN role
- API routes check authentication and role
- Frontend redirects non-admins
- Navigation button only visible to admins

**Authentication Flow:**
1. Check if user is logged in (401 if not)
2. Verify user has ADMIN role (403 if not)
3. Process request with proper authorization
4. Return appropriate error messages

### API Endpoints

#### GET `/api/users`
- **Access:** Admin only
- **Returns:** List of all users with details
- **Includes:** User info, assignee profiles, roles

#### POST `/api/users`
- **Access:** Admin only
- **Body:** Email, name, password, role, assignee details
- **Validation:** 
  - Email uniqueness
  - Password strength
  - Required fields
- **Returns:** Created user object

#### PUT `/api/users/[id]`
- **Access:** Admin only
- **Body:** Name, email, role (any combination)
- **Validation:**
  - User exists
  - Email uniqueness (if changed)
- **Returns:** Updated user object

#### DELETE `/api/users/[id]`
- **Access:** Admin only
- **Validation:**
  - User exists
  - Not self-deletion
- **Returns:** Success confirmation

#### POST `/api/users/[id]/reset-password`
- **Access:** Admin only
- **Body:** newPassword
- **Validation:**
  - User exists
  - Password length (min 6)
- **Returns:** Success confirmation

---

## 🎨 UI Components

### Main Page: `app/users/page.tsx`
- **Route:** `/users`
- **Access:** Admin only (auto-redirect)
- **Features:**
  - User table with all information
  - Action buttons per user
  - Create user button
  - Loading states
  - Error handling

### CreateUserDialog: `components/create-user-dialog.tsx`
- Full user creation form
- Optional assignee profile creation
- Form validation
- Loading states
- Success callbacks

### EditUserDialog: `components/edit-user-dialog.tsx`
- Update user details
- Role changes
- Email updates
- Form validation

### ResetPasswordDialog: `components/reset-password-dialog.tsx`
- Secure password reset
- Password confirmation
- Validation feedback
- Error handling

---

## 📊 Data Models

### User Model
```typescript
interface User {
  id: string
  email: string
  name: string | null
  role: 'ADMIN' | 'SUPERVISOR' | 'EMPLOYEE' | 'VIEWER'
  emailVerified: boolean
  assigneeId: string | null
  createdAt: string
  updatedAt: string
  assignee?: Assignee | null
}
```

### Assignee Model
```typescript
interface Assignee {
  id: string
  name: string
  email: string
  role: string
  department: string
  avatar?: string | null
}
```

---

## 🔄 Workflow Examples

### Example 1: Onboard New Employee

1. Admin clicks "Add User"
2. Fills in:
   - Email: `sarah.jones@company.com`
   - Name: `Sarah Jones`
   - Password: `Welcome2024!`
   - Role: `EMPLOYEE`
   - Assignee Name: `Sarah Jones`
   - Department: `Marketing`
   - Job Role: `Content Writer`
3. Clicks "Create User"
4. Sarah can now login and be assigned tasks
5. Admin can see Sarah in user list

### Example 2: Promote User to Supervisor

1. Admin finds user in table
2. Clicks Edit (pencil) icon
3. Changes Role from `EMPLOYEE` to `SUPERVISOR`
4. Clicks "Save Changes"
5. User now has supervisor permissions
6. Can create and manage tasks

### Example 3: Handle Forgotten Password

1. Admin finds user in table
2. Clicks Reset Password (key) icon
3. Enters new password: `NewSecure2024!`
4. Confirms password
5. Clicks "Reset Password"
6. Notifies user of new password
7. User can login immediately

### Example 4: Remove Inactive User

1. Admin finds inactive user
2. Clicks Delete (trash) icon
3. Reviews confirmation dialog
4. Confirms deletion
5. User is removed from system
6. Tasks remain but unassigned

---

## 🛠️ Troubleshooting

### Common Issues

**Issue:** "Admin access required" error
- **Cause:** User doesn't have ADMIN role
- **Solution:** Login with an admin account or contact admin

**Issue:** "Email already in use" when creating user
- **Cause:** Email exists in database
- **Solution:** Use different email or edit existing user

**Issue:** "Cannot delete your own account" error
- **Cause:** Admin tried to delete themselves
- **Solution:** Use different admin account for deletion

**Issue:** User management button not visible
- **Cause:** Logged in as non-admin
- **Solution:** Login with admin credentials

**Issue:** 401 Unauthorized errors
- **Cause:** Token expired or missing
- **Solution:** Re-login to get fresh token

---

## 🚀 Advanced Features

### Future Enhancements

**Planned:**
- 📧 Email invitations
- 🔐 Two-factor authentication
- 📝 Audit logging
- 🔍 Advanced search and filters
- 📊 User activity reports
- 👥 Bulk operations
- 📤 Export user list
- 🎭 Custom roles
- ⏰ Account expiration
- 🔔 Email notifications

**Coming Soon:**
- Password complexity rules
- Password expiration
- Login history
- Session management
- Account lockout after failed attempts

---

## 💡 Best Practices

### For Admins

1. **User Creation:**
   - ✅ Use strong initial passwords
   - ✅ Always create assignee profiles for task users
   - ✅ Double-check email addresses
   - ✅ Assign appropriate roles

2. **Role Management:**
   - ✅ Follow principle of least privilege
   - ✅ Review roles quarterly
   - ✅ Document role changes
   - ✅ Test permissions after changes

3. **Password Resets:**
   - ✅ Use secure temporary passwords
   - ✅ Notify users promptly
   - ✅ Encourage password changes
   - ✅ Never share passwords via insecure channels

4. **User Deletion:**
   - ✅ Archive user data first
   - ✅ Reassign critical tasks
   - ✅ Document deletion reasons
   - ✅ Consider deactivation instead

---

## 📚 Related Documentation

- [RBAC Implementation](./RBAC-IMPLEMENTATION.md) - Role-based access control details
- [RBAC Status](./RBAC-STATUS.md) - Testing and current status
- [Admin Users](./ADMIN-USERS.md) - Environment-specific admin credentials
- [Environments](./ENVIRONMENTS.md) - Multi-environment setup
- [README](./README.md) - General project documentation

---

## 🧪 Testing the System

### Test Scenarios

1. **Test Admin Access:**
   ```bash
   # Login as admin
   Email: admin.dev@company.com
   Password: admin123
   # Should see User Management button
   ```

2. **Test Non-Admin Redirect:**
   ```bash
   # Login as employee
   Email: sarah.chen@company.com
   Password: password123
   # Try to access /users
   # Should redirect to home
   ```

3. **Test User Creation:**
   - Create user with all fields
   - Create user without assignee
   - Try duplicate email (should fail)
   - Try weak password (should fail)

4. **Test User Updates:**
   - Edit user name
   - Change user role
   - Update email
   - Try duplicate email (should fail)

5. **Test Password Reset:**
   - Reset with valid password
   - Try mismatched passwords (should fail)
   - Try short password (should fail)
   - Login with new password

6. **Test User Deletion:**
   - Delete a user
   - Try to delete self (should fail)
   - Verify user is removed
   - Check tasks are unaffected

---

## 🔗 API Reference

### Error Responses

**401 Unauthorized:**
```json
{
  "error": "Authentication required"
}
```

**403 Forbidden:**
```json
{
  "error": "Admin access required"
}
```

**404 Not Found:**
```json
{
  "error": "User not found"
}
```

**400 Bad Request:**
```json
{
  "error": "Email already in use"
}
```

**500 Server Error:**
```json
{
  "error": "Failed to create user"
}
```

---

**Last Updated:** November 11, 2025
**Version:** 1.0.0
**Maintainer:** Admin Team

