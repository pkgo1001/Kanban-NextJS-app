import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { registerSchema, PasswordUtils, TokenUtils, AuthError, AUTH_ERRORS } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request data
    const validation = registerSchema.safeParse(body)
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

    const { email, password, name } = validation.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await PasswordUtils.hash(password)
    
    // Generate email verification token
    const emailVerificationToken = TokenUtils.generateEmailVerificationToken()

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        emailVerificationToken,
      },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    // TODO: Send email verification email
    // For now, we'll just log the token (remove this in production)
    console.log(`Email verification token for ${email}: ${emailVerificationToken}`)

    return NextResponse.json({
      message: 'User registered successfully. Please check your email to verify your account.',
      user
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    
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
