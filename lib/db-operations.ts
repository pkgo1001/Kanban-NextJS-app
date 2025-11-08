import { Task, TaskStatus } from '@/components/task-card'
import { PasswordUtils, TokenUtils, AuthError, AUTH_ERRORS, type RegisterData, type LoginCredentials, type User } from '@/lib/auth'

// Base API URL helper
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side
    return ''
  }
  // Server-side
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'
}

// HTTP client helper
const apiClient = {
  async get(endpoint: string) {
    const response = await fetch(`${getBaseUrl()}/api${endpoint}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  async post(endpoint: string, data: any) {
    const response = await fetch(`${getBaseUrl()}/api${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  async put(endpoint: string, data: any) {
    const response = await fetch(`${getBaseUrl()}/api${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  async patch(endpoint: string, data: any) {
    const response = await fetch(`${getBaseUrl()}/api${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  async delete(endpoint: string) {
    const response = await fetch(`${getBaseUrl()}/api${endpoint}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  },
}

// Get all tasks with their related data
export async function getTasks(): Promise<Task[]> {
  try {
    return await apiClient.get('/tasks')
  } catch (error) {
    console.error('Error fetching tasks:', error)
    throw new Error('Failed to fetch tasks')
  }
}

// Get tasks by status
export async function getTasksByStatus(status: TaskStatus): Promise<Task[]> {
  try {
    const allTasks = await getTasks()
    return allTasks.filter(task => task.status === status)
  } catch (error) {
    console.error('Error fetching tasks by status:', error)
    throw new Error('Failed to fetch tasks by status')
  }
}

// Create a new task
export async function createTask(taskData: Omit<Task, 'id'>): Promise<Task> {
  try {
    return await apiClient.post('/tasks', taskData)
  } catch (error) {
    console.error('Error creating task:', error)
    throw new Error('Failed to create task')
  }
}

// Update an existing task
export async function updateTask(taskId: string, taskData: Partial<Task>): Promise<Task> {
  try {
    return await apiClient.put(`/tasks/${taskId}`, taskData)
  } catch (error) {
    console.error('Error updating task:', error)
    throw new Error('Failed to update task')
  }
}

// Delete a task
export async function deleteTask(taskId: string): Promise<void> {
  try {
    await apiClient.delete(`/tasks/${taskId}`)
  } catch (error) {
    console.error('Error deleting task:', error)
    throw new Error('Failed to delete task')
  }
}

// Update task status (used for drag and drop)
export async function updateTaskStatus(taskId: string, newStatus: TaskStatus): Promise<Task> {
  try {
    return await apiClient.patch(`/tasks/${taskId}`, { status: newStatus })
  } catch (error) {
    console.error('Error updating task status:', error)
    throw new Error('Failed to update task status')
  }
}

// Get all assignees
export async function getAssignees() {
  try {
    return await apiClient.get('/assignees')
  } catch (error) {
    console.error('Error fetching assignees:', error)
    throw new Error('Failed to fetch assignees')
  }
}

// Get all tags
export async function getTags() {
  try {
    return await apiClient.get('/tags')
  } catch (error) {
    console.error('Error fetching tags:', error)
    throw new Error('Failed to fetch tags')
  }
}

// =============================================================================
// USER AUTHENTICATION FUNCTIONS
// =============================================================================

// Register a new user
export async function registerUser(userData: RegisterData): Promise<User> {
  try {
    return await apiClient.post('/auth/register', userData)
  } catch (error) {
    console.error('Error registering user:', error)
    throw new Error('Failed to register user')
  }
}

// Login user
export async function loginUser(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
  try {
    return await apiClient.post('/auth/login', credentials)
  } catch (error) {
    console.error('Error logging in user:', error)
    throw new Error('Failed to login')
  }
}

// Get current user profile
export async function getCurrentUser(): Promise<User> {
  try {
    return await apiClient.get('/auth/me')
  } catch (error) {
    console.error('Error fetching current user:', error)
    throw new Error('Failed to fetch user profile')
  }
}

// Update user profile
export async function updateUserProfile(userId: string, userData: Partial<User>): Promise<User> {
  try {
    return await apiClient.put(`/auth/users/${userId}`, userData)
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw new Error('Failed to update profile')
  }
}

// Request password reset
export async function requestPasswordReset(email: string): Promise<{ success: boolean }> {
  try {
    return await apiClient.post('/auth/password-reset', { email })
  } catch (error) {
    console.error('Error requesting password reset:', error)
    throw new Error('Failed to request password reset')
  }
}

// Reset password with token
export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean }> {
  try {
    return await apiClient.post('/auth/password-reset/confirm', { token, password: newPassword })
  } catch (error) {
    console.error('Error resetting password:', error)
    throw new Error('Failed to reset password')
  }
}

// Verify email with token
export async function verifyEmail(token: string): Promise<{ success: boolean }> {
  try {
    return await apiClient.post('/auth/verify-email', { token })
  } catch (error) {
    console.error('Error verifying email:', error)
    throw new Error('Failed to verify email')
  }
}

// Resend email verification
export async function resendEmailVerification(email: string): Promise<{ success: boolean }> {
  try {
    return await apiClient.post('/auth/resend-verification', { email })
  } catch (error) {
    console.error('Error resending verification email:', error)
    throw new Error('Failed to resend verification email')
  }
}

// Change password (for authenticated users)
export async function changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
  try {
    return await apiClient.post('/auth/change-password', { currentPassword, newPassword })
  } catch (error) {
    console.error('Error changing password:', error)
    throw new Error('Failed to change password')
  }
}

// Logout user
export async function logoutUser(): Promise<{ success: boolean }> {
  try {
    return await apiClient.post('/auth/logout', {})
  } catch (error) {
    console.error('Error logging out:', error)
    throw new Error('Failed to logout')
  }
}