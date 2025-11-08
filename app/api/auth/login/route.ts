import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { loginSchema, PasswordUtils, AuthError, AUTH_ERRORS } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request data
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          message: 'Validation failed',
          errors: validation.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await PasswordUtils.verify(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if email is verified (optional - you can disable this check for development)
    if (!user.emailVerified) {
      return NextResponse.json(
        { 
          message: 'Please verify your email address before logging in',
          code: AUTH_ERRORS.EMAIL_NOT_VERIFIED
        },
        { status: 403 }
      )
    }

    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    // TODO: Generate JWT token and set secure cookie
    // For now, we'll return a simple success response
    const token = `temp_token_${user.id}_${Date.now()}` // Replace with real JWT

    return NextResponse.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    })

  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof AuthError) {
      return NextResponse.json(
        { message: error.message, code: error.code },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
