import { NextRequest } from 'next/server';
import { prisma } from './db';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
  role: 'ADMIN' | 'SUPERVISOR' | 'EMPLOYEE' | 'VIEWER';
  assigneeId?: string | null;
}

/**
 * Get authenticated user from request
 * In a real application, this would validate a JWT token
 * For now, we'll extract user ID from the auth token stored in localStorage
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    // Extract user ID from the simple token (temp_token_userId_timestamp)
    // In production, validate a real JWT here
    const token = authHeader.replace('Bearer ', '');
    const parts = token.split('_');
    
    if (parts.length < 3 || parts[0] !== 'temp' || parts[1] !== 'token') {
      return null;
    }

    const userId = parts[2];

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        assigneeId: true,
      }
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      role: user.role,
      assigneeId: user.assigneeId,
    };
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return null;
  }
}

/**
 * Require authentication - throws error if user not authenticated
 */
export async function requireAuth(request: NextRequest): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

