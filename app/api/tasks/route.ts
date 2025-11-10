import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Priority, Status } from '@prisma/client'
import { Task, TaskPriority, TaskStatus } from '@/components/task-card'
import { getAuthenticatedUser } from '@/lib/auth-helpers'
import { canCreateTask } from '@/lib/permissions'

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

// GET /api/tasks - Get all tasks
export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        assignee: true,
        tags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const transformedTasks = tasks.map(transformTaskFromDb)
    return NextResponse.json(transformedTasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    // Check authentication and permissions
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has permission to create tasks
    if (!canCreateTask(user.role)) {
      return NextResponse.json(
        { error: 'You do not have permission to create tasks' },
        { status: 403 }
      );
    }

    const taskData = await request.json()
    
    // Find assignee if provided
    let assigneeId: string | undefined = undefined
    if (taskData.assignee && taskData.assignee.trim()) {
      const assignee = await prisma.assignee.findFirst({
        where: {
          name: taskData.assignee
        }
      })
      assigneeId = assignee?.id
    }

    // Create the task first
    const createdTask = await prisma.task.create({
      data: {
        title: taskData.title,
        description: taskData.description || null,
        priority: priorityToEnum(taskData.priority),
        status: statusToEnum(taskData.status),
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        assigneeId: assigneeId || null
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

    // Handle tags if provided
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
            taskId: createdTask.id,
            tagId: tag.id
          }
        })
      }

      // Fetch the task again with updated tags
      const taskWithTags = await prisma.task.findUnique({
        where: { id: createdTask.id },
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

    return NextResponse.json(transformTaskFromDb(createdTask))
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}
