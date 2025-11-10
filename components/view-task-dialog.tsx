"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Calendar, User, Tag, AlertCircle } from "lucide-react"
import { type Task } from "@/components/task-card"

interface ViewTaskDialogProps {
  task: Task | null
  open: boolean
  onClose: () => void
}

export function ViewTaskDialog({ task, open, onClose }: ViewTaskDialogProps) {
  if (!task) return null

  const priorityColors = {
    low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
  }

  const statusLabels = {
    "todo": "TODO",
    "in-progress": "In Progress",
    "done": "Done"
  }

  const statusColors = {
    "todo": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    "done": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{task.title}</DialogTitle>
          <DialogDescription>
            Task details - Read only
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status and Priority */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground">Status:</Label>
              <Badge variant="secondary" className={statusColors[task.status]}>
                {statusLabels[task.status]}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground">Priority:</Label>
              <Badge variant="secondary" className={priorityColors[task.priority]}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Badge>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Description
              </Label>
              <div className="rounded-md border border-input bg-muted/50 px-4 py-3 text-sm whitespace-pre-wrap">
                {task.description}
              </div>
            </div>
          )}

          {/* Assignee */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Assignee
            </Label>
            <div className="rounded-md border border-input bg-muted/50 px-4 py-3 text-sm">
              {task.assignee || "Unassigned"}
            </div>
          </div>

          {/* Due Date */}
          {task.dueDate && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Due Date
              </Label>
              <div className="rounded-md border border-input bg-muted/50 px-4 py-3 text-sm">
                {new Date(task.dueDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </Label>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

