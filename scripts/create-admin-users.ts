const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdminUser(email: string, name: string) {
  // Hash password (using 'admin123' as default password)
  const hashedPassword = await bcrypt.hash('admin123', 10)

  // Check if user already exists
  const existing = await prisma.user.findUnique({
    where: { email }
  })

  if (existing) {
    console.log(`⚠️  User ${email} already exists, skipping...`)
    return existing
  }

  // Create assignee first
  const assignee = await prisma.assignee.create({
    data: {
      name: name,
      email: email,
      role: 'Admin',
      department: 'Management'
    }
  })

  // Create admin user
  const user = await prisma.user.create({
    data: {
      email: email,
      password: hashedPassword,
      name: name,
      role: 'ADMIN',
      emailVerified: true,
      assigneeId: assignee.id
    }
  })

  console.log(`✅ Created admin user: ${email}`)
  console.log(`   Name: ${name}`)
  console.log(`   Role: ADMIN`)
  console.log(`   Password: admin123`)
  console.log(`   Assignee ID: ${assignee.id}`)
  
  return user
}

async function main() {
  const env = process.env.NODE_ENV || 'development'
  const dbUrl = process.env.DATABASE_URL || ''
  
  console.log(`\n🔧 Creating admin user for environment...`)
  console.log(`📊 Database: ${dbUrl}`)
  console.log('─'.repeat(50))

  try {
    // Determine which admin to create based on database URL
    if (dbUrl.includes('dev.db')) {
      await createAdminUser('admin.dev@company.com', 'Admin Dev')
    } else if (dbUrl.includes('qa.db')) {
      await createAdminUser('admin.qa@company.com', 'Admin QA')
    } else if (dbUrl.includes('prod.db')) {
      await createAdminUser('admin.prd@company.com', 'Admin Production')
    } else {
      console.log('⚠️  Unknown database, creating default admin...')
      await createAdminUser('admin@company.com', 'Admin User')
    }

    console.log('─'.repeat(50))
    console.log('✨ Admin user creation completed!\n')
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

