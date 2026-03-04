import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthenticatedUser } from '@/lib/auth-helpers'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated user
    const authUser = await getAuthenticatedUser(request)

    // Only admins can verify emails
    if (authUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only administrators can verify user emails' },
        { status: 403 }
      )
    }

    const { id: userId } = await params

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if email is already verified
    if (existingUser.emailVerified) {
      return NextResponse.json(
        { message: 'Email is already verified' },
        { status: 200 }
      )
    }

    // Verify the email
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        emailVerified: true,
        emailVerificationToken: null // Clear the verification token
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        assigneeId: true,
        createdAt: true,
        updatedAt: true,
        assignee: {
          select: {
            name: true,
            department: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Email verified successfully',
      user: updatedUser
    })

  } catch (error) {
    console.error('Error verifying email:', error)
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    )
  }
}

