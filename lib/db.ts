import { PrismaClient } from '@prisma/client'

// Global variable to prevent multiple instances of Prisma Client in development
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Use a single instance of Prisma Client
export const prisma =
  globalThis.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
