import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Priority, Status } from '@prisma/client'
import { Task, TaskPriority, TaskStatus } from '@/components/task-card'

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
    const taskData = await request.json()

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
