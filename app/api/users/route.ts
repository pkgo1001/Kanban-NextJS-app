import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthenticatedUser } from '@/lib/auth-helpers'
import bcrypt from 'bcryptjs'

// GET /api/users - List all users (Admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Only admins can view users
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create new user (Admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Only admins can create users
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, name, password, role, assigneeName, assigneeDepartment, assigneeRole } = body;

    // Validate required fields
    if (!email || !name || !password || !role) {
      return NextResponse.json(
        { error: 'Email, name, password, and role are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create assignee if details provided
    let assigneeId = null;
    if (assigneeName) {
      const assignee = await prisma.assignee.create({
        data: {
          name: assigneeName,
          email: email,
          role: assigneeRole || role,
          department: assigneeDepartment || 'General'
        }
      });
      assigneeId = assignee.id;
    }

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
        emailVerified: true,
        assigneeId
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
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

