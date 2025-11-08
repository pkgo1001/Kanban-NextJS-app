import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/assignees - Get all assignees
export async function GET() {
  try {
    const assignees = await prisma.assignee.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(assignees)
  } catch (error) {
    console.error('Error fetching assignees:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assignees' },
      { status: 500 }
    )
  }
}
