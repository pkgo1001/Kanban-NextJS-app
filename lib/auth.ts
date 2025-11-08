import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Password validation schema following best practices
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')
  .max(128, 'Password must be less than 128 characters')

// Email validation schema
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .toLowerCase()
  .max(254, 'Email must be less than 254 characters')

// User registration schema
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
})

// User login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
})

// Password reset schema
export const passwordResetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
})

// Password hashing utilities
export class PasswordUtils {
  private static readonly SALT_ROUNDS = 12

  /**
   * Hash a plain text password
   */
  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS)
  }

  /**
   * Verify a plain text password against a hash
   */
  static async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  /**
   * Check if password meets strength requirements
   */
  static validateStrength(password: string): {
    isValid: boolean
    errors: string[]
    score: number // 0-100
  } {
    const errors: string[] = []
    let score = 0

    // Length check
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    } else {
      score += 20
      if (password.length >= 12) score += 10
      if (password.length >= 16) score += 10
    }

    // Character type checks
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    } else {
      score += 15
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    } else {
      score += 15
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number')
    } else {
      score += 15
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
      errors.push('Password must contain at least one special character')
    } else {
      score += 15
    }

    // Bonus points for variety
    const uniqueChars = new Set(password).size
    if (uniqueChars >= password.length * 0.7) score += 10

    return {
      isValid: errors.length === 0,
      errors,
      score: Math.min(score, 100)
    }
  }
}

// Token generation utilities
export class TokenUtils {
  /**
   * Generate a secure random token
   */
  static generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    const randomArray = new Uint8Array(length)
    
    // Use crypto.getRandomValues for secure random generation
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(randomArray)
    } else if (typeof global !== 'undefined' && global.crypto) {
      global.crypto.getRandomValues(randomArray)
    } else {
      // Fallback for Node.js
      const crypto = require('crypto')
      const buffer = crypto.randomBytes(length)
      for (let i = 0; i < length; i++) {
        randomArray[i] = buffer[i]
      }
    }
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(randomArray[i] % chars.length)
    }
    
    return result
  }

  /**
   * Generate email verification token
   */
  static generateEmailVerificationToken(): string {
    return this.generateSecureToken(48)
  }

  /**
   * Generate password reset token
   */
  static generatePasswordResetToken(): string {
    return this.generateSecureToken(48)
  }
}

// Types for authentication
export interface User {
  id: string
  email: string
  name?: string
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AuthUser extends User {
  // Add any additional fields needed for authenticated user
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name?: string
}

// Authentication errors
export class AuthError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  WEAK_PASSWORD: 'WEAK_PASSWORD',
} as const
