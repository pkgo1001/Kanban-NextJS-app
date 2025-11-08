"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { KanbanBoard } from "@/components/kanban-board"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import { LogOut, User } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

export default function Home() {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<{ name: string; email: string } | null>(null)
  const { user, isLoading, logout, isAuthenticated } = useAuth()
  const router = useRouter()

  // ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  })

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    setFormData(values)
    setOpen(false)
    form.reset()
  }

  return (
    <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Kanban Dashboard</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                <span className="text-muted-foreground">Welcome,</span>
                <span className="font-medium">{user?.name || user?.email}</span>
              </div>
              <ThemeToggle />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={logout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="kanban" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
            <TabsTrigger value="components">Component Demo</TabsTrigger>
          </TabsList>
          
          <TabsContent value="kanban" className="mt-6">
            <KanbanBoard />
          </TabsContent>
          
          <TabsContent value="components" className="mt-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Buttons Card */}
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>
                Different button variants and sizes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="destructive">Destructive</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
              </div>
            </CardContent>
          </Card>

          {/* Dialog Card */}
          <Card>
            <CardHeader>
              <CardTitle>Dialog</CardTitle>
              <CardDescription>
                Modal dialog with form integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button>Open Dialog</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                      Make changes to your profile here. Click save when you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} />
                            </FormControl>
                            <FormDescription>
                              This is your public display name.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="your@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="submit">Save changes</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardContent>
            {formData && (
              <CardFooter>
                <div className="text-sm text-muted-foreground">
                  Last submitted: {formData.name} ({formData.email})
                </div>
              </CardFooter>
            )}
          </Card>

          {/* Form Card */}
          <Card>
            <CardHeader>
              <CardTitle>Standalone Form</CardTitle>
              <CardDescription>
                Form with validation using React Hook Form and Zod
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((values) => {
                  alert(`Form submitted with: ${JSON.stringify(values, null, 2)}`)
                  form.reset()
                })} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">Submit</Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Theme Card */}
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Theme System</CardTitle>
              <CardDescription>
                Toggle between light and dark modes using next-themes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    The theme toggle in the header switches between light, dark, and system themes.
                    All components automatically adapt to the selected theme.
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Installation Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>shadcn/ui Setup Complete! 🎉</CardTitle>
            <CardDescription>
              All requested components have been installed and configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-2">Components Installed:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✅ Button - with multiple variants and sizes</li>
                  <li>✅ Card - with header, content, and footer</li>
                  <li>✅ Dialog - modal with overlay and close</li>
                  <li>✅ Form - with React Hook Form and Zod validation</li>
                  <li>✅ Input & Label - form controls</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Features Configured:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✅ next-themes for light/dark mode</li>
                  <li>✅ Tailwind CSS v4 integration</li>
                  <li>✅ TypeScript support</li>
                  <li>✅ CSS variables for theming</li>
                  <li>✅ Responsive design</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
