# API Reference

This document describes the server API for the Kanban Next.js app. All API routes live under `/api/*` (App Router server routes).

Base URL (development): `http://localhost:3000/api`

---

## Authentication

### POST /api/auth/login
Authenticate a user.

- Request body (application/json):
  - email: string (required)
  - password: string (required)

- Response (200):
  - { message: 'Login successful', user: { id, email, name, role, emailVerified, assigneeId, createdAt, updatedAt }, token }

- Errors:
  - 400 Validation failed
  - 401 Invalid email or password
  - 403 Email not verified (if enforcement enabled)
  - 500 Internal server error

- Notes: the current implementation returns a temporary token (`temp_token_*`) — replace with a real JWT/cookie in production.

### POST /api/auth/register
Register a new user.

- Request body (application/json):
  - email: string (required)
  - password: string (required)
  - name: string (required)

- Response (201):
  - { message: 'User registered successfully. Please check your email to verify your account.', user }

- Errors:
  - 400 Validation failed
  - 409 User with this email already exists
  - 500 Internal server error

- Notes: produces an email verification token (logged to server in dev). Email sending is TODO.

---

## Tasks

Task endpoints follow `/api/tasks`.

Task object (returned by endpoints):
- id: string
- title: string
- description?: string
- priority: "low" | "medium" | "high"
- status: "todo" | "in-progress" | "done"
- assignee?: string (assignee name)
- assigneeId?: string | null
- ownerId?: string | null
- dueDate?: string (YYYY-MM-DD)
- tags: string[] (tag names)

### GET /api/tasks
Get all tasks.

- Auth: none (public read)
- Response (200): Task[]
- Errors: 500

Example cURL:

```bash
curl -s http://localhost:3000/api/tasks
```

### POST /api/tasks
Create a new task.

- Auth: Required. User must be authenticated and have permission to create tasks (`canCreateTask`).
- Request body (application/json):
  - title: string (required)
  - description?: string
  - priority?: "low" | "medium" | "high" (default: medium)
  - status?: "todo" | "in-progress" | "done" (default: todo)
  - assignee?: string (assignee name)
  - dueDate?: string (YYYY-MM-DD)
  - tags?: string[]

- Response (200): Task (created task)
- Errors:
  - 401 Authentication required
  - 403 You do not have permission to create tasks
  - 500 Internal server error

Example cURL (JSON body):

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Example Task","description":"...","priority":"high","assignee":"Sarah Chen","dueDate":"2025-12-31","tags":["testing","kanban"]}'
```

### PUT /api/tasks/[id]
Update a task (partial/full).

- Path params:
  - id: task id
- Auth: Required. Behavior depends on the update:
  - Status changes are validated against move permissions (`canMoveTask`).
  - Other updates validated against edit permissions (`canEditTask`).
- Request body (application/json): any subset of task fields above (title, description, priority, status, assignee, dueDate, tags).
- Response (200): Task (updated)
- Errors:
  - 401 Authentication required
  - 403 Permission errors (move/edit)
  - 404 Task not found
  - 500 Internal server error

### PATCH /api/tasks/[id]
Update task status only (used by drag & drop).

- Path params: id
- Auth: Required. Must satisfy `canMoveTask`.
- Request body:
  - { status: "todo" | "in-progress" | "done" }
- Response (200): Task (updated)
- Errors:
  - 401, 403 (permission), 404, 500

Example cURL (move task):

```bash
curl -X PATCH http://localhost:3000/api/tasks/<TASK_ID> \
  -H "Content-Type: application/json" \
  -d '{"status":"in-progress"}'
```

### DELETE /api/tasks/[id]
Delete a task.

- Path params: id
- Auth: Required. Must satisfy `canDeleteTask` permission rules.
- Response (200): { success: true }
- Errors: 401, 403, 404, 500

Example cURL:

```bash
curl -X DELETE http://localhost:3000/api/tasks/<TASK_ID>
```

---

## Users

### GET /api/users
List users (Admin only).

- Auth: Required, Admin role
- Response (200): array of users with fields:
  - id, email, name, role, emailVerified, assigneeId, createdAt, updatedAt, assignee (name/department/role)
- Errors: 401, 403, 500

### POST /api/users
Create a new user (Admin only).

- Auth: Admin required
- Request body:
  - email (required), name (required), password (required), role (required)
  - assigneeName, assigneeDepartment, assigneeRole (optional) — will create an Assignee profile
- Response (201): created user (selected fields)
- Errors: 400 missing fields, 409 exists, 401, 403, 500

### PUT /api/users/[id]
Update a user (Admin only).

- Auth: Admin required
- Path param: id
- Request body: { name?, email?, role? }
- Response (200): updated user
- Errors: 401, 403, 404, 400, 500

### DELETE /api/users/[id]
Delete a user (Admin only). Self-deletion is prevented.

- Auth: Admin required
- Path param: id
- Response (200): { success: true, message }
- Errors: 401, 403, 404, 500

### POST /api/users/[id]/reset-password
Reset a user's password (Admin only).

- Auth: Admin required
- Request body: { newPassword: string }
- Validation: password must be at least 6 characters
- Response (200): { success: true, message }
- Errors: 400, 401, 403, 404, 500

---

## Tags

### GET /api/tags
Get all tags.

- Auth: none
- Response (200): Tag[] (database model: id, name, color?, createdAt)
- Errors: 500

---

## Assignees

### GET /api/assignees
Get all assignees.

- Auth: none
- Response (200): Assignee[] (id, name, email, role, department, avatar?, createdAt, updatedAt)
- Errors: 500

---

## Authentication & Authorization notes

- Several endpoints require authentication; the repository uses `getAuthenticatedUser(request)` in `lib/auth-helpers` to resolve the currently authenticated user. In production this should be backed by secure cookies or JWT tokens.
- Permission rules are implemented in `lib/permissions` (functions like `canCreateTask`, `canEditTask`, `canDeleteTask`, `canMoveTask`). Consult that file to confirm specific role-based rules.

## Error format

Most endpoints return JSON with an `error` or `message` field and proper HTTP status codes on failure. Example:

```json
{ "error": "You do not have permission to delete this task" }
```

or validation errors for auth routes:

```json
{
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "Invalid email" }]
}
```

## Quick checklist for clients

- To create/update/delete tasks and users, authenticate first.
- Use ISO date strings `YYYY-MM-DD` for `dueDate` fields.
- `priority` and `status` are case-insensitive but accepted values are described above.
- Tags are referenced by name — the API will create tags when necessary.

---

If you want, I can also:
- Add OpenAPI/Swagger spec generation (YAML/JSON) from these routes
- Add examples per endpoint including full request/response bodies
- Add Postman collection JSON

Choose one and I will generate it next.
