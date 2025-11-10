"use client"

import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  UserRole,
  PermissionContext,
  canCreateTask,
  canEditTask,
  canDeleteTask,
  canAssignTask,
  canMoveTask,
  canViewTasks,
  canChangePriority,
  canChangeDueDate,
  canManageTags,
  getUserPermissions,
  getRoleDescription
} from '@/lib/permissions';

export interface Task {
  id: string;
  ownerId?: string | null;
  assigneeId?: string | null;
}

export function usePermissions(task?: Task) {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    if (!user) {
      return {
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canAssign: false,
        canMove: false,
        canView: true,
        canChangePriority: false,
        canChangeDueDate: false,
        canManageTags: false,
        userRole: null as UserRole | null,
        roleDescription: 'Not authenticated',
      };
    }

    const context: PermissionContext = {
      userRole: user.role,
      userId: user.id,
      userAssigneeId: user.assigneeId || null,
      taskOwnerId: task?.ownerId || null,
      taskAssigneeId: task?.assigneeId || null,
    };

    const perms = getUserPermissions(context);

    return {
      ...perms,
      userRole: user.role,
      roleDescription: getRoleDescription(user.role),
    };
  }, [user, task]);

  return permissions;
}

/**
 * Hook to check if user can perform a specific action on a task
 */
export function useTaskPermissions(taskId?: string, taskData?: Task) {
  const permissions = usePermissions(taskData);

  return {
    ...permissions,
    // Convenience methods for common checks
    canInteract: permissions.canEdit || permissions.canMove,
    isReadOnly: !permissions.canEdit && !permissions.canMove && !permissions.canDelete,
    showEditButton: permissions.canEdit,
    showDeleteButton: permissions.canDelete,
    showAssignButton: permissions.canAssign,
  };
}

