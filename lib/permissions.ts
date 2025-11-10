/**
 * Role-based Access Control (RBAC) for Kanban Board
 * 
 * Permission Rules:
 * - ADMIN: Full access to everything
 * - SUPERVISOR: Can create, edit, delete, and assign tasks
 * - EMPLOYEE: Can only move tasks assigned to them
 * - VIEWER: Read-only access, cannot modify anything
 */

export type UserRole = 'ADMIN' | 'SUPERVISOR' | 'EMPLOYEE' | 'VIEWER';

export interface PermissionContext {
  userRole: UserRole;
  userId: string;
  taskOwnerId?: string | null;
  taskAssigneeId?: string | null;
  userAssigneeId?: string | null;
}

/**
 * Check if user can create new tasks
 */
export function canCreateTask(userRole: UserRole): boolean {
  return userRole === 'ADMIN' || userRole === 'SUPERVISOR';
}

/**
 * Check if user can edit a specific task
 */
export function canEditTask(context: PermissionContext): boolean {
  const { userRole } = context;
  
  // Admin and Supervisor can edit any task
  return userRole === 'ADMIN' || userRole === 'SUPERVISOR';
}

/**
 * Check if user can delete a specific task
 */
export function canDeleteTask(context: PermissionContext): boolean {
  const { userRole } = context;
  
  // Only Admin and Supervisor can delete tasks
  return userRole === 'ADMIN' || userRole === 'SUPERVISOR';
}

/**
 * Check if user can assign tasks to other users
 */
export function canAssignTask(userRole: UserRole): boolean {
  return userRole === 'ADMIN' || userRole === 'SUPERVISOR';
}

/**
 * Check if user can move/change task status
 * Employees can only move tasks assigned to them
 */
export function canMoveTask(context: PermissionContext): boolean {
  const { userRole, userId, userAssigneeId, taskAssigneeId } = context;
  
  // Admin and Supervisor can move any task
  if (userRole === 'ADMIN' || userRole === 'SUPERVISOR') {
    return true;
  }
  
  // Employee can only move tasks assigned to them
  if (userRole === 'EMPLOYEE') {
    // Check if the task is assigned to this user's assignee profile
    return userAssigneeId !== null && taskAssigneeId === userAssigneeId;
  }
  
  // Viewer cannot move any tasks
  return false;
}

/**
 * Check if user can view tasks (all roles can view)
 */
export function canViewTasks(userRole: UserRole): boolean {
  return true; // All roles can view tasks
}

/**
 * Check if user can change task priority
 */
export function canChangePriority(context: PermissionContext): boolean {
  const { userRole } = context;
  
  // Only Admin and Supervisor can change priority
  return userRole === 'ADMIN' || userRole === 'SUPERVISOR';
}

/**
 * Check if user can change task due date
 */
export function canChangeDueDate(context: PermissionContext): boolean {
  const { userRole } = context;
  
  // Only Admin and Supervisor can change due date
  return userRole === 'ADMIN' || userRole === 'SUPERVISOR';
}

/**
 * Check if user can add/remove tags from tasks
 */
export function canManageTags(context: PermissionContext): boolean {
  const { userRole } = context;
  
  // Only Admin and Supervisor can manage tags
  return userRole === 'ADMIN' || userRole === 'SUPERVISOR';
}

/**
 * Get all permissions for a user
 */
export function getUserPermissions(context: PermissionContext) {
  return {
    canCreate: canCreateTask(context.userRole),
    canEdit: canEditTask(context),
    canDelete: canDeleteTask(context),
    canAssign: canAssignTask(context.userRole),
    canMove: canMoveTask(context),
    canView: canViewTasks(context.userRole),
    canChangePriority: canChangePriority(context),
    canChangeDueDate: canChangeDueDate(context),
    canManageTags: canManageTags(context),
  };
}

/**
 * Get user-friendly permission description
 */
export function getRoleDescription(userRole: UserRole): string {
  switch (userRole) {
    case 'ADMIN':
      return 'Full access to all tasks and board features';
    case 'SUPERVISOR':
      return 'Can create, edit, delete, and assign tasks';
    case 'EMPLOYEE':
      return 'Can move tasks assigned to you';
    case 'VIEWER':
      return 'Read-only access to the board';
    default:
      return 'No permissions';
  }
}

/**
 * Validate if user has permission for an action
 * Throws error if not authorized
 */
export function requirePermission(
  hasPermission: boolean,
  action: string
): void {
  if (!hasPermission) {
    throw new Error(`Unauthorized: You don't have permission to ${action}`);
  }
}

