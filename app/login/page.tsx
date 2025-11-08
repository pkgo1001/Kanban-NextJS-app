"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react"
import { loginSchema } from "@/lib/auth"
import { useAuth } from "@/contexts/AuthContext"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { login, isAuthenticated, isLoading: authLoading } = useAuth()
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const router = useRouter()

  // ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Redirect to main page if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, authLoading, router])

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return null
  }

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoggingIn(true)
    setError(null)

    const result = await login(values.email, values.password)
    
    if (result.success) {
      // AuthContext will handle the state update and the useEffect will redirect
      router.push('/')
    } else {
      setError(result.error || 'Login failed')
    }
    
    setIsLoggingIn(false)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <ThemeToggle />
        </div>

        {/* Login Card */}
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl flex items-center gap-2">
              <LogIn className="h-5 w-5" />
              Sign In
            </CardTitle>
            <CardDescription>
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          disabled={isLoggingIn}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            disabled={isLoggingIn}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoggingIn}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoggingIn}>
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              <Link 
                href="/register" 
                className="text-primary hover:underline"
              >
                Don't have an account? Sign up
              </Link>
            </div>
            
            <div className="text-sm text-center text-muted-foreground">
              <Link 
                href="/forgot-password" 
                className="text-primary hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Password Requirements Info */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-sm">Password Requirements</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <p>• At least 8 characters long</p>
            <p>• Contains uppercase and lowercase letters</p>
            <p>• Contains at least one number</p>
            <p>• Contains at least one special character</p>
          </CardContent>
        </Card>

        {/* Demo Instructions */}
        <Card className="w-full bg-muted/50">
          <CardHeader>
            <CardTitle className="text-sm">Demo Instructions</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p><strong>To test:</strong></p>
            <p>1. Create an account with a valid email and strong password</p>
            <p>2. Use API endpoint: <code className="bg-muted px-1 py-0.5 rounded">POST /api/auth/register</code></p>
            <p>3. Example: email: <code className="bg-muted px-1 py-0.5 rounded">test@example.com</code></p>
            <p>4. Example: password: <code className="bg-muted px-1 py-0.5 rounded">MySecure123!</code></p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
