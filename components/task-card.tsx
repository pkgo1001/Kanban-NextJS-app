import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, Edit3, GripVertical, ChevronDown, ChevronUp } from "lucide-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

export type TaskPriority = "low" | "medium" | "high"
export type TaskStatus = "todo" | "in-progress" | "done"

export interface Task {
  id: string
  title: string
  description?: string
  priority: TaskPriority
  status: TaskStatus
  assignee?: string
  dueDate?: string
  tags?: string[]
}

interface TaskCardProps {
  task: Task
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void
  onEdit?: (task: Task) => void
  disableDrag?: boolean
  isMinimized?: boolean
  onToggleMinimize?: (taskId: string) => void
}

const priorityColors = {
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
}

const statusColors = {
  todo: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  done: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
}

export function TaskCard({ task, onStatusChange, onEdit, disableDrag = false, isMinimized = false, onToggleMinimize }: TaskCardProps) {
  const sortable = useSortable({ 
    id: task.id,
    disabled: disableDrag
  })

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = sortable

  const style = disableDrag ? {} : {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleStatusChange = (newStatus: TaskStatus) => {
    if (onStatusChange) {
      onStatusChange(task.id, newStatus)
    }
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(task)
    }
  }

  const handleToggleMinimize = () => {
    if (onToggleMinimize) {
      onToggleMinimize(task.id)
    }
  }

  return (
    <Card 
      ref={disableDrag ? undefined : setNodeRef}
      style={style}
      className={`w-full hover:shadow-md transition-all duration-200 ${
        !disableDrag && isDragging ? 'opacity-50 rotate-2 shadow-lg' : ''
      } ${isMinimized ? 'pb-2' : ''}`}
    >
      {isMinimized ? (
        /* Minimized View */
        <CardContent className="p-3">
          <div className="flex items-center justify-between gap-2">
            {/* Left side: Drag handle and title */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {!disableDrag && (
                <button
                  className="cursor-grab active:cursor-grabbing hover:bg-muted p-1 rounded flex-shrink-0"
                  {...attributes}
                  {...listeners}
                >
                  <GripVertical className="h-3 w-3 text-muted-foreground" />
                </button>
              )}
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-medium leading-5 truncate">
                  {task.title}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-muted-foreground truncate">
                    {task.assignee || "Unassigned"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right side: Priority, actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <Badge 
                variant="secondary" 
                className={`text-xs px-1.5 py-0.5 ${priorityColors[task.priority]}`}
              >
                {task.priority.charAt(0).toUpperCase()}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleEdit}
              >
                <Edit3 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleToggleMinimize}
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      ) : (
        /* Expanded View */
        <>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2 flex-1">
                {!disableDrag && (
                  <button
                    className="mt-1 cursor-grab active:cursor-grabbing hover:bg-muted p-1 rounded"
                    {...attributes}
                    {...listeners}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
                <div className="flex-1">
                  <CardTitle className="text-sm font-medium leading-5">
                    {task.title}
                  </CardTitle>
                  {task.description && (
                    <CardDescription className="text-xs text-muted-foreground mt-1">
                      {task.description}
                    </CardDescription>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Badge 
                  variant="secondary" 
                  className={priorityColors[task.priority]}
                >
                  {task.priority}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleEdit}
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleToggleMinimize}
                >
                  <ChevronUp className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {task.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Task Details */}
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-3 w-3" />
                <span>{task.assignee || "Unassigned"}</span>
              </div>
              
              {task.dueDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>{task.dueDate}</span>
                </div>
              )}
            </div>

            {/* Status Actions */}
            <div className="flex flex-wrap gap-1 mt-4">
              {task.status !== 'todo' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-7"
                  onClick={() => handleStatusChange('todo')}
                >
                  TODO
                </Button>
              )}
              {task.status !== 'in-progress' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-7"
                  onClick={() => handleStatusChange('in-progress')}
                >
                  {task.status === 'todo' ? 'Start' : 'Progress'}
                </Button>
              )}
              {task.status !== 'done' && (
                <Button 
                variant="outline" 
                size="sm" 
                className="text-xs h-7"
                onClick={() => handleStatusChange('done')}
              >
                Done
              </Button>
            )}
          </div>
        </CardContent>
      </>
    )}
  </Card>
)
}
