import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Priority, Status } from '@prisma/client'
import { Task, TaskPriority, TaskStatus } from '@/components/task-card'
import { getAuthenticatedUser } from '@/lib/auth-helpers'
import { canEditTask, canDeleteTask, canMoveTask } from '@/lib/permissions'

// Type conversion utilities
const priorityFromEnum = (priority: Priority): TaskPriority => {
  return priority.toLowerCase() as TaskPriority
}

const statusFromEnum = (status: Status): TaskStatus => {
  switch (status) {
    case 'TODO':
      return 'todo'
    case 'IN_PROGRESS':
      return 'in-progress'
    case 'DONE':
      return 'done'
    default:
      return 'todo'
  }
}

const priorityToEnum = (priority: TaskPriority): Priority => {
  return priority.toUpperCase() as Priority
}

const statusToEnum = (status: TaskStatus): Status => {
  switch (status) {
    case 'todo':
      return 'TODO'
    case 'in-progress':
      return 'IN_PROGRESS'
    case 'done':
      return 'DONE'
    default:
      return 'TODO'
  }
}

// Database to UI Task conversion
const transformTaskFromDb = (dbTask: any): Task => {
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description || undefined,
    priority: priorityFromEnum(dbTask.priority),
    status: statusFromEnum(dbTask.status),
    assignee: dbTask.assignee?.name || undefined,
    assigneeId: dbTask.assigneeId || null,
    ownerId: dbTask.ownerId || null,
    dueDate: dbTask.dueDate ? dbTask.dueDate.toISOString().split('T')[0] : undefined,
    tags: dbTask.tags?.map((taskTag: any) => taskTag.tag.name) || []
  }
}

interface RouteParams {
  params: { id: string }
}

// PUT /api/tasks/[id] - Update a task
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const taskId = params.id
    
    // Check authentication
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the existing task
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        status: true,
        ownerId: true,
        assigneeId: true
      }
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    const taskData = await request.json()

    // Check if this is a status change (move operation)
    const isStatusChange = taskData.status !== undefined && 
                           statusToEnum(taskData.status) !== existingTask.status;

    if (isStatusChange) {
      // Check move permission (Employees can only move their own tasks)
      const canMove = canMoveTask({
        userRole: user.role,
        userId: user.id,
        userAssigneeId: user.assigneeId || null,
        taskAssigneeId: existingTask.assigneeId,
        taskOwnerId: existingTask.ownerId
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
        userAssigneeId: user.assigneeId || null
      });

      if (!canEdit) {
        return NextResponse.json({
          error: 'You do not have permission to edit this task'
        }, { status: 403 });
      }
    }

    // Find assignee if provided
    let assigneeId: string | null = null
    if (taskData.assignee !== undefined) {
      if (taskData.assignee && taskData.assignee.trim()) {
        const assignee = await prisma.assignee.findFirst({
          where: {
            name: taskData.assignee
          }
        })
        assigneeId = assignee?.id || null
      }
    }

    // Prepare the update data
    const updateData: any = {}
    if (taskData.title !== undefined) updateData.title = taskData.title
    if (taskData.description !== undefined) updateData.description = taskData.description || null
    if (taskData.priority !== undefined) updateData.priority = priorityToEnum(taskData.priority)
    if (taskData.status !== undefined) updateData.status = statusToEnum(taskData.status)
    if (taskData.dueDate !== undefined) updateData.dueDate = taskData.dueDate ? new Date(taskData.dueDate) : null
    if (taskData.assignee !== undefined) updateData.assigneeId = assigneeId

    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignee: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    // Handle tags if provided
    if (taskData.tags !== undefined) {
      // Remove existing tag relationships
      await prisma.taskTag.deleteMany({
        where: { taskId: taskId }
      })

      // Add new tag relationships
      if (taskData.tags && taskData.tags.length > 0) {
        for (const tagName of taskData.tags) {
          // Find or create the tag
          let tag = await prisma.tag.findFirst({
            where: { name: tagName }
          })

          if (!tag) {
            tag = await prisma.tag.create({
              data: { name: tagName }
            })
          }

          // Create the task-tag relationship
          await prisma.taskTag.create({
            data: {
              taskId: taskId,
              tagId: tag.id
            }
          })
        }
      }

      // Fetch the task again with updated tags
      const taskWithTags = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          assignee: true,
          tags: {
            include: {
              tag: true
            }
          }
        }
      })

      return NextResponse.json(transformTaskFromDb(taskWithTags))
    }

    return NextResponse.json(transformTaskFromDb(updatedTask))
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

// PATCH /api/tasks/[id] - Update task status only (for drag and drop)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const taskId = params.id
    
    // Check authentication
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the existing task
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        ownerId: true,
        assigneeId: true
      }
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check move permission (drag & drop)
    const canMove = canMoveTask({
      userRole: user.role,
      userId: user.id,
      userAssigneeId: user.assigneeId || null,
      taskAssigneeId: existingTask.assigneeId,
      taskOwnerId: existingTask.ownerId
    });

    if (!canMove) {
      return NextResponse.json({
        error: 'You can only move tasks assigned to you'
      }, { status: 403 });
    }

    const { status } = await request.json()

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: statusToEnum(status)
      },
      include: {
        assignee: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    return NextResponse.json(transformTaskFromDb(updatedTask))
  } catch (error) {
    console.error('Error updating task status:', error)
    return NextResponse.json(
      { error: 'Failed to update task status' },
      { status: 500 }
    )
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const taskId = params.id
    
    // Check authentication
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the existing task
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        ownerId: true,
        assigneeId: true
      }
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check delete permission
    const canDelete = canDeleteTask({
      userRole: user.role,
      userId: user.id,
      taskOwnerId: existingTask.ownerId,
      taskAssigneeId: existingTask.assigneeId,
      userAssigneeId: user.assigneeId || null
    });

    if (!canDelete) {
      return NextResponse.json({
        error: 'You do not have permission to delete this task'
      }, { status: 403 });
    }

    await prisma.task.delete({
      where: { id: taskId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}
