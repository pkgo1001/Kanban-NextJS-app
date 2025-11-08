"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TaskCard, type Task, type TaskStatus } from "@/components/task-card"
import { EditTaskDialog } from "@/components/edit-task-dialog"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { Plus, MoreHorizontal, Minimize2, Maximize2, Loader2, Palette } from "lucide-react"
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import {
  getTasks,
  createTask,
  updateTask,
  updateTaskStatus,
} from "@/lib/db-operations"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface KanbanBoardProps {
  // No props needed since we're fetching data from the database
}

const columns: Array<{
  id: TaskStatus
  title: string
  description: string
  color: string
}> = [
  {
    id: "todo",
    title: "TODO",
    description: "Tasks to be started",
    color: "bg-purple-50 dark:bg-purple-900/20"
  },
  {
    id: "in-progress",
    title: "In Progress",
    description: "Tasks being worked on",
    color: "bg-blue-50 dark:bg-blue-900/20"
  },
  {
    id: "done",
    title: "Done",
    description: "Completed tasks",
    color: "bg-green-50 dark:bg-green-900/20"
  }
]

// Droppable area component for empty columns
function DroppableArea({ 
  id, 
  children 
}: { 
  id: string; 
  children: React.ReactNode 
}) {
  const { setNodeRef, isOver } = useDroppable({ id })
  
  return (
    <div 
      ref={setNodeRef}
      className={`space-y-3 min-h-[100px] p-1 rounded-md transition-colors ${
        isOver ? 'bg-muted/50' : ''
      }`}
    >
      {children}
    </div>
  )
}

export function KanbanBoard({}: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [addingTaskForColumn, setAddingTaskForColumn] = useState<TaskStatus | null>(null)
  const [mounted, setMounted] = useState(false)
  const [originalTaskStatus, setOriginalTaskStatus] = useState<Record<string, TaskStatus>>({})
  
  // Minimize state management
  const [minimizedCards, setMinimizedCards] = useState<Set<string>>(new Set())
  const [columnMinimizeState, setColumnMinimizeState] = useState<Record<TaskStatus, boolean>>({
    todo: false,
    "in-progress": false,
    done: false
  })

  // Column color management
  const [columnColors, setColumnColors] = useState<Record<TaskStatus, string>>({
    todo: "bg-purple-50 dark:bg-purple-900/20",
    "in-progress": "bg-blue-50 dark:bg-blue-900/20",
    done: "bg-green-50 dark:bg-green-900/20"
  })

  // Load tasks from database
  const loadTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      const tasksData = await getTasks()
      setTasks(tasksData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks')
      console.error('Error loading tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    loadTasks()
  }, [])
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleTaskStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      // Optimistic update
      const updatedTasks = tasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
      setTasks(updatedTasks)
      
      // Update in database
      await updateTaskStatus(taskId, newStatus)
    } catch (err) {
      console.error('Error updating task status:', err)
      // Revert optimistic update on error
      loadTasks()
    }
  }

  const handleTaskUpdate = async (updatedTask: Task) => {
    try {
      // Update in database
      const dbTask = await updateTask(updatedTask.id, updatedTask)
      
      // Update local state
      const updatedTasks = tasks.map(task =>
        task.id === updatedTask.id ? dbTask : task
      )
      setTasks(updatedTasks)
    } catch (err) {
      console.error('Error updating task:', err)
      setError('Failed to update task')
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
  }

  const handleTaskCreate = async (newTaskData: Omit<Task, 'id'>) => {
    try {
      const newTask = await createTask(newTaskData)
      setTasks(prevTasks => [...prevTasks, newTask])
    } catch (err) {
      console.error('Error creating task:', err)
      setError('Failed to create task')
    }
  }

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status)
  }

  const handleAddTask = (status: TaskStatus) => {
    setAddingTaskForColumn(status)
  }

  const handleToggleCardMinimize = (taskId: string) => {
    setMinimizedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }

  const handleToggleColumnMinimize = (status: TaskStatus) => {
    const columnTasks = getTasksByStatus(status)
    const allMinimized = columnTasks.every(task => minimizedCards.has(task.id))
    
    setMinimizedCards(prev => {
      const newSet = new Set(prev)
      columnTasks.forEach(task => {
        if (allMinimized) {
          newSet.delete(task.id)
        } else {
          newSet.add(task.id)
        }
      })
      return newSet
    })
    
    setColumnMinimizeState(prev => ({
      ...prev,
      [status]: !allMinimized
    }))
  }

  const handleColumnColorChange = (status: TaskStatus, color: string) => {
    setColumnColors(prev => ({
      ...prev,
      [status]: color
    }))
  }

  // Predefined color options for columns
  const colorOptions = [
    { name: "Purple", value: "bg-purple-50 dark:bg-purple-900/20", preview: "bg-purple-200" },
    { name: "Blue", value: "bg-blue-50 dark:bg-blue-900/20", preview: "bg-blue-200" },
    { name: "Green", value: "bg-green-50 dark:bg-green-900/20", preview: "bg-green-200" },
    { name: "Yellow", value: "bg-yellow-50 dark:bg-yellow-900/20", preview: "bg-yellow-200" },
    { name: "Pink", value: "bg-pink-50 dark:bg-pink-900/20", preview: "bg-pink-200" },
    { name: "Indigo", value: "bg-indigo-50 dark:bg-indigo-900/20", preview: "bg-indigo-200" },
    { name: "Red", value: "bg-red-50 dark:bg-red-900/20", preview: "bg-red-200" },
    { name: "Orange", value: "bg-orange-50 dark:bg-orange-900/20", preview: "bg-orange-200" },
    { name: "Gray", value: "bg-gray-50 dark:bg-gray-900/20", preview: "bg-gray-200" },
    { name: "Slate", value: "bg-slate-50 dark:bg-slate-900/20", preview: "bg-slate-200" }
  ]

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = tasks.find(task => task.id === active.id)
    setActiveTask(task || null)
    
    // Store the original status before any drag operations
    if (task) {
      setOriginalTaskStatus(prev => ({
        ...prev,
        [task.id]: task.status
      }))
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    // Find the containers
    const activeTask = tasks.find(task => task.id === activeId)
    if (!activeTask) return

    const activeContainer = activeTask.status
    // Check if dropping on a column (including empty columns) or another task
    const overContainer = columns.find(col => col.id === overId)?.id || 
                          tasks.find(task => task.id === overId)?.status

    if (!overContainer || activeContainer === overContainer) return

    setTasks(currentTasks => {
      const activeTasks = currentTasks.filter(task => task.status === activeContainer)
      const overTasks = currentTasks.filter(task => task.status === overContainer)

      const activeIndex = activeTasks.findIndex(task => task.id === activeId)
      const overIndex = overTasks.findIndex(task => task.id === overId)

      let newIndex: number
      if (overId in columns.map(col => col.id)) {
        newIndex = overTasks.length + 1
      } else {
        const isBelowOverItem = over && 
          active.rect.current.translated && 
          active.rect.current.translated.top > over.rect.top + over.rect.height
        
        const modifier = isBelowOverItem ? 1 : 0
        newIndex = overIndex >= 0 ? overIndex + modifier : overTasks.length + 1
      }

      return currentTasks.map(task => {
        if (task.id === activeId) {
          return { ...task, status: overContainer }
        }
        return task
      })
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null)
    
    const { active, over } = event
    const taskId = active.id as string
    
    // Always clean up the stored original status
    const originalStatus = originalTaskStatus[taskId]
    setOriginalTaskStatus(prev => {
      const updated = { ...prev }
      delete updated[taskId]
      return updated
    })

    if (!over) return

    const task = tasks.find(t => t.id === taskId)
    if (!task || !originalStatus) return

    // Determine the new status
    let newStatus: TaskStatus = originalStatus // Start with original status
    
    // Check if dropped on a column (including empty columns)
    const column = columns.find(col => col.id === over.id)
    if (column) {
      newStatus = column.id
    } else {
      // Dropped on another task - use that task's status
      const overTask = tasks.find(t => t.id === over.id)
      if (overTask) {
        newStatus = overTask.status
      }
    }

    // Only make API call if the status actually changed from the original
    if (newStatus !== originalStatus) {
      handleTaskStatusChange(taskId, newStatus)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading tasks...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="w-full">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-destructive">
            <span className="font-medium">Error:</span>
            <span>{error}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2" 
            onClick={loadTasks}
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const boardContent = (
    <div className="w-full">
      {/* Board Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Project Board</h2>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span>Total: {tasks.length} tasks</span>
          <span>•</span>
          <span>TODO: {getTasksByStatus("todo").length}</span>
          <span>•</span>
          <span>In Progress: {getTasksByStatus("in-progress").length}</span>
          <span>•</span>
          <span>Done: {getTasksByStatus("done").length}</span>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.id)
          
          return (
            <Card key={column.id} className={`flex flex-col ${columnColors[column.id]}`}>
              {/* Column Header */}
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-medium">
                      {column.title}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {columnTasks.length}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleToggleColumnMinimize(column.id)}
                      title={columnTasks.every(task => minimizedCards.has(task.id)) ? "Expand all" : "Minimize all"}
                    >
                      {columnTasks.every(task => minimizedCards.has(task.id)) ? (
                        <Maximize2 className="h-4 w-4" />
                      ) : (
                        <Minimize2 className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleAddTask(column.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel className="flex items-center gap-2">
                          <Palette className="h-4 w-4" />
                          Column Colors
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {colorOptions.map((colorOption) => (
                          <DropdownMenuItem
                            key={colorOption.name}
                            onClick={() => handleColumnColorChange(column.id, colorOption.value)}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <div className={`w-4 h-4 rounded-full ${colorOption.preview}`} />
                            {colorOption.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {column.description}
                </p>
              </CardHeader>

              {/* Column Content */}
              <CardContent className="flex-1 overflow-auto">
                {mounted ? (
                  <SortableContext
                    items={columnTasks.map(task => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <DroppableArea id={column.id}>
                      {columnTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                          <button 
                            className="rounded-full bg-muted p-3 mb-2 hover:bg-muted/80 transition-colors"
                            onClick={() => handleAddTask(column.id)}
                            title={`Add task to ${column.title}`}
                          >
                            <Plus className="h-5 w-5" />
                          </button>
                          <p className="text-sm">No tasks yet</p>
                          <p className="text-xs">Add a task to get started</p>
                        </div>
                      ) : (
                        columnTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onStatusChange={handleTaskStatusChange}
                            onEdit={handleEditTask}
                            disableDrag={!mounted}
                            isMinimized={minimizedCards.has(task.id)}
                            onToggleMinimize={handleToggleCardMinimize}
                          />
                        ))
                      )}
                    </DroppableArea>
                  </SortableContext>
                ) : (
                  <div className="space-y-3 min-h-[100px] p-1">
                    {columnTasks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <button 
                          className="rounded-full bg-muted p-3 mb-2 hover:bg-muted/80 transition-colors"
                          onClick={() => handleAddTask(column.id)}
                          title={`Add task to ${column.title}`}
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                        <p className="text-sm">No tasks yet</p>
                        <p className="text-xs">Add a task to get started</p>
                      </div>
                    ) : (
                      columnTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onStatusChange={handleTaskStatusChange}
                          onEdit={handleEditTask}
                          disableDrag={true}
                          isMinimized={minimizedCards.has(task.id)}
                          onToggleMinimize={handleToggleCardMinimize}
                        />
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )

  return (
    <>
      {mounted ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {boardContent}
          <DragOverlay>
            {activeTask ? (
              <TaskCard
                task={activeTask}
                onStatusChange={() => {}}
                onEdit={() => {}}
                disableDrag={true}
                isMinimized={minimizedCards.has(activeTask.id)}
                onToggleMinimize={() => {}}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        boardContent
      )}

      {/* Edit Task Dialog */}
      <EditTaskDialog
        task={editingTask}
        open={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleTaskUpdate}
      />

      {/* Add Task Dialog */}
      <AddTaskDialog
        open={!!addingTaskForColumn}
        defaultStatus={addingTaskForColumn || "todo"}
        onClose={() => setAddingTaskForColumn(null)}
        onSave={handleTaskCreate}
      />
    </>
  )
}
