export interface Assignee {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  department: string
}

// NOTE: Static assignee data used for:
// 1. Database seeding (prisma/seed.ts) 
// 2. Fallback in getAssigneeNamesFromDb if database fails
// The application runtime primarily gets assignees from the database
export const assignees: Assignee[] = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah.chen@company.com",
    role: "Senior UX Designer",
    department: "Design"
  },
  {
    id: "2", 
    name: "Mike Johnson",
    email: "mike.johnson@company.com",
    role: "DevOps Engineer",
    department: "Engineering"
  },
  {
    id: "3",
    name: "Alex Rodriguez",
    email: "alex.rodriguez@company.com", 
    role: "Full Stack Developer",
    department: "Engineering"
  },
  {
    id: "4",
    name: "Emma Davis",
    email: "emma.davis@company.com",
    role: "Product Manager",
    department: "Product"
  },
  {
    id: "5",
    name: "James Wilson",
    email: "james.wilson@company.com",
    role: "Frontend Developer", 
    department: "Engineering"
  },
  {
    id: "6",
    name: "Lisa Thompson",
    email: "lisa.thompson@company.com",
    role: "QA Engineer",
    department: "Quality Assurance"
  },
  {
    id: "7",
    name: "David Park",
    email: "david.park@company.com",
    role: "Backend Developer",
    department: "Engineering"
  },
  {
    id: "8",
    name: "Maria Garcia",
    email: "maria.garcia@company.com",
    role: "UI Designer",
    department: "Design"
  },
  {
    id: "9",
    name: "Robert Kim",
    email: "robert.kim@company.com",
    role: "Data Analyst",
    department: "Analytics"
  },
  {
    id: "10",
    name: "Jennifer Lee",
    email: "jennifer.lee@company.com",
    role: "Marketing Specialist",
    department: "Marketing"
  }
]


// Helper function to get assignee names from database for dropdown
export const getAssigneeNamesFromDb = async (): Promise<Array<{value: string, label: string}>> => {
  try {
    const { getAssignees } = await import('./db-operations')
    const dbAssignees = await getAssignees()
    
    return [
      { value: "unassigned", label: "Unassigned" },
      ...dbAssignees.map((assignee: any) => ({
        value: assignee.name,
        label: assignee.name
      }))
    ]
  } catch (error) {
    console.error('Error fetching assignees from database:', error)
    // Fallback to static data
    return [
      { value: "unassigned", label: "Unassigned" },
      ...assignees.map(assignee => ({
        value: assignee.name,
        label: assignee.name
      }))
    ]
  }
}
