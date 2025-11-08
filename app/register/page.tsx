"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { Eye, EyeOff, Loader2, UserPlus, Check, X } from "lucide-react"
import { registerSchema, PasswordUtils } from "@/lib/auth"
import { registerUser } from "@/lib/db-operations"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number
    errors: string[]
    isValid: boolean
  } | null>(null)

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  })

  // Watch password field for strength validation
  const watchedPassword = form.watch("password")

  // Update password strength when password changes
  useState(() => {
    if (watchedPassword) {
      const strength = PasswordUtils.validateStrength(watchedPassword)
      setPasswordStrength(strength)
    } else {
      setPasswordStrength(null)
    }
  }, [watchedPassword])

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await registerUser(values)
      console.log('Registration successful:', result)
      
      setSuccess('Account created successfully! Please check your email to verify your account.')
      form.reset()
      
    } catch (err) {
      console.error('Registration error:', err)
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const getStrengthColor = (score: number) => {
    if (score < 50) return "text-red-500"
    if (score < 75) return "text-yellow-500"
    return "text-green-500"
  }

  const getStrengthText = (score: number) => {
    if (score < 25) return "Very Weak"
    if (score < 50) return "Weak"
    if (score < 75) return "Good"
    if (score < 90) return "Strong"
    return "Very Strong"
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Create Account</h1>
          <ThemeToggle />
        </div>

        {/* Register Card */}
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Sign Up
            </CardTitle>
            <CardDescription>
              Create a new account to access your personal Kanban board
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Your full name"
                          disabled={isLoading}
                          {...field}
                        />
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
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This will be your username for logging in
                      </FormDescription>
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
                            placeholder="Create a strong password"
                            disabled={isLoading}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      
                      {/* Password Strength Indicator */}
                      {passwordStrength && watchedPassword && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Password Strength:
                            </span>
                            <span className={`text-xs font-medium ${getStrengthColor(passwordStrength.score)}`}>
                              {getStrengthText(passwordStrength.score)} ({passwordStrength.score}/100)
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                passwordStrength.score < 50 ? 'bg-red-500' :
                                passwordStrength.score < 75 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${passwordStrength.score}%` }}
                            />
                          </div>
                          
                          {/* Password Requirements Checklist */}
                          <div className="space-y-1">
                            {[
                              { check: watchedPassword.length >= 8, text: "At least 8 characters" },
                              { check: /[a-z]/.test(watchedPassword), text: "Lowercase letter" },
                              { check: /[A-Z]/.test(watchedPassword), text: "Uppercase letter" },
                              { check: /[0-9]/.test(watchedPassword), text: "Number" },
                              { check: /[^a-zA-Z0-9]/.test(watchedPassword), text: "Special character" },
                            ].map((req, index) => (
                              <div key={index} className="flex items-center gap-2 text-xs">
                                {req.check ? (
                                  <Check className="h-3 w-3 text-green-500" />
                                ) : (
                                  <X className="h-3 w-3 text-red-500" />
                                )}
                                <span className={req.check ? "text-green-600" : "text-muted-foreground"}>
                                  {req.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                    <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              <Link 
                href="/login" 
                className="text-primary hover:underline"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Back to App */}
        <div className="text-center">
          <Link 
            href="/" 
            className="text-sm text-muted-foreground hover:text-primary"
          >
            ← Back to Kanban Board
          </Link>
        </div>
      </div>
    </div>
  )
}
