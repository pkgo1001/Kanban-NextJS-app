import { PrismaClient } from '@prisma/client'
import { assignees } from '../lib/assignees'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')
  
  // Clear existing assignees (keep tasks and tags created by users)
  console.log('🧹 Clearing existing assignees...')
  await prisma.assignee.deleteMany()
  
  console.log('👥 Seeding assignees...')
  // Seed assignees
  for (const assignee of assignees) {
    await prisma.assignee.create({
      data: {
        name: assignee.name,
        email: assignee.email,
        role: assignee.role,
        department: assignee.department,
        avatar: assignee.avatar,
      },
    })
  }
  
  console.log('✅ Seed completed successfully!')
  
  // Show summary
  const assigneeCount = await prisma.assignee.count()
  console.log(`📊 Created: 👥 ${assigneeCount} assignees`)
  console.log('📝 Tasks and tags are managed through the UI - create your own!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
