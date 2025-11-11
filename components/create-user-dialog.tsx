"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface CreateUserDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateUserDialog({ open, onClose, onSuccess }: CreateUserDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    role: 'EMPLOYEE',
    assigneeName: '',
    assigneeDepartment: '',
    assigneeRole: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create user')
      }

      // Reset form
      setFormData({
        email: '',
        name: '',
        password: '',
        role: 'EMPLOYEE',
        assigneeName: '',
        assigneeDepartment: '',
        assigneeRole: ''
      })

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error creating user:', err)
      alert(err.message || 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setFormData({
        email: '',
        name: '',
        password: '',
        role: 'EMPLOYEE',
        assigneeName: '',
        assigneeDepartment: '',
        assigneeRole: ''
      })
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new user to the system with specified role and permissions
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@company.com"
              />
            </div>

            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min. 6 characters"
              />
            </div>

            <div>
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin - Full system access</SelectItem>
                  <SelectItem value="SUPERVISOR">Supervisor - Manage tasks & users</SelectItem>
                  <SelectItem value="EMPLOYEE">Employee - Assigned tasks only</SelectItem>
                  <SelectItem value="VIEWER">Viewer - Read-only access</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Optional Assignee Details */}
          <div className="border-t pt-4 space-y-4">
            <h3 className="font-medium text-sm">Assignee Details (Optional)</h3>
            <p className="text-xs text-muted-foreground">
              Create an assignee profile to allow task assignment
            </p>

            <div>
              <Label htmlFor="assigneeName">Assignee Name</Label>
              <Input
                id="assigneeName"
                value={formData.assigneeName}
                onChange={(e) => setFormData({ ...formData, assigneeName: e.target.value })}
                placeholder="Leave empty to skip"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assigneeDepartment">Department</Label>
                <Input
                  id="assigneeDepartment"
                  value={formData.assigneeDepartment}
                  onChange={(e) => setFormData({ ...formData, assigneeDepartment: e.target.value })}
                  placeholder="Engineering"
                />
              </div>
              <div>
                <Label htmlFor="assigneeRole">Job Role</Label>
                <Input
                  id="assigneeRole"
                  value={formData.assigneeRole}
                  onChange={(e) => setFormData({ ...formData, assigneeRole: e.target.value })}
                  placeholder="Developer"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

