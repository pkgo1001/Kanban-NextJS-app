# 🚀 Kanban NextJS App

A modern, full-stack Kanban board application built with Next.js 15, featuring user authentication, drag-and-drop task management, and a beautiful responsive UI.

![Next.js](https://img.shields.io/badge/Next.js-15.5.6-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.17.1-2D3748?style=for-the-badge&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🔐 Authentication System
- User registration and login
- Secure password hashing with bcryptjs
- Session management with JWT-like authentication
- Protected routes and middleware

### 📋 Kanban Board
- **Drag & Drop**: Intuitive task management with @dnd-kit
- **Three Columns**: TODO, IN_PROGRESS, DONE
- **Real-time Updates**: Instant UI updates
- **Task Management**: Create, edit, delete, and move tasks

### 🎯 Task Features
- **Priority Levels**: LOW, MEDIUM, HIGH
- **Due Dates**: Set and track deadlines
- **Assignees**: Assign tasks to team members
- **Tags**: Organize tasks with color-coded tags
- **Rich Descriptions**: Detailed task descriptions

### 🎨 Modern UI/UX
- **Dark/Light Theme**: Toggle with next-themes
- **Responsive Design**: Works on all devices
- **shadcn/ui Components**: Beautiful, accessible components
- **Form Validation**: React Hook Form + Zod validation
- **Loading States**: Smooth user experience

### 👥 User Management
- User profiles and settings
- Assignee management system
- Role-based permissions
- Team collaboration features

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Lucide React** - Beautiful icons
- **next-themes** - Theme management

### Backend
- **Next.js API Routes** - Serverless functions
- **Prisma** - Type-safe database ORM
- **SQLite** - Lightweight database (production ready)
- **bcryptjs** - Password hashing
- **Zod** - Runtime type validation

### Drag & Drop
- **@dnd-kit/core** - Drag and drop functionality
- **@dnd-kit/sortable** - Sortable lists
- **@dnd-kit/utilities** - Helper utilities

### Forms & Validation
- **React Hook Form** - Performant forms
- **@hookform/resolvers** - Zod integration
- **Zod** - Schema validation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/pkgo1001/Kanban-NextJS-app.git
cd Kanban-NextJS-app
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up the database**
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed the database (optional)
npm run db:seed
```

4. **Set up environment variables**
Create a `.env.local` file in the root directory:
```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="your-secret-key-here"
```

5. **Start the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

6. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### Getting Started
1. **Register**: Create a new account on the register page
2. **Login**: Sign in with your credentials
3. **Dashboard**: Access the Kanban board and start managing tasks

### Managing Tasks
1. **Create Task**: Click "Add Task" to create a new task
2. **Edit Task**: Click on any task card to edit details
3. **Move Task**: Drag tasks between columns (TODO → IN_PROGRESS → DONE)
4. **Set Priority**: Choose LOW, MEDIUM, or HIGH priority
5. **Assign Users**: Assign tasks to team members
6. **Add Tags**: Organize tasks with colored tags

### User Management
1. **Profile**: Update your user profile information
2. **Assignees**: Manage team members and their roles
3. **Settings**: Configure your preferences

## 🗄️ Database Schema

### Core Models

#### User
- Authentication and profile information
- Links to owned tasks and assignee profile

#### Task
- Title, description, priority, status
- Due dates and timestamps
- Relationships to users and assignees

#### Assignee
- Team member information
- Role and department details
- Avatar support

#### Tag System
- Flexible tagging with colors
- Many-to-many relationship with tasks

### Relationships
```
User ←→ Task (owner)
Task ←→ Assignee (assigned to)
Task ←→ Tag (many-to-many)
User ←→ Assignee (optional link)
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Tasks
- `GET /api/tasks` - Fetch all tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/[id]` - Get specific task
- `PUT /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task

### Assignees
- `GET /api/assignees` - Fetch all assignees
- `POST /api/assignees` - Create assignee

### Tags
- `GET /api/tags` - Fetch all tags
- `POST /api/tags` - Create new tag

## 🗂️ Project Structure

```
├── app/                    # Next.js 15 App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── tasks/         # Task management
│   │   ├── assignees/     # User management
│   │   └── tags/          # Tag system
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   └── page.tsx           # Main dashboard
├── components/            # Reusable React components
│   ├── ui/                # shadcn/ui components
│   ├── kanban-board.tsx   # Main Kanban component
│   ├── task-card.tsx      # Task display component
│   └── theme-toggle.tsx   # Theme switcher
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication state
├── lib/                   # Utility functions
│   ├── db.ts              # Database connection
│   ├── auth.ts            # Authentication helpers
│   └── utils.ts           # General utilities
├── prisma/                # Database configuration
│   ├── schema.prisma      # Database schema
│   ├── migrations/        # Database migrations
│   └── seed.ts            # Database seeding
└── public/                # Static assets
```

## 🎨 Customization

### Themes
The app supports light and dark themes. Customize colors in:
- `app/globals.css` - CSS variables for themes
- `tailwind.config.js` - Tailwind configuration

### Components
All UI components are built with shadcn/ui and can be customized:
- `components/ui/` - Base component styles
- Modify component props and styling as needed

### Database
To modify the database schema:
1. Edit `prisma/schema.prisma`
2. Run `npx prisma db push`
3. Update TypeScript types if needed

## 🚢 Deployment

### Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/pkgo1001/Kanban-NextJS-app)

1. **Connect GitHub**: Link your repository to Vercel
2. **Environment Variables**: Set up your environment variables
3. **Deploy**: Vercel will automatically build and deploy

### Railway
1. **Connect Repository**: Link to Railway
2. **Set Environment Variables**:
   ```env
   DATABASE_URL="file:./prisma/prod.db"
   NEXTAUTH_SECRET="your-production-secret"
   ```
3. **Deploy**: Railway handles the build process

### Docker (Coming Soon)
Docker support will be added in future releases.

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:push      # Push schema changes
npm run db:seed      # Seed database
npm run db:reset     # Reset database
npm run db:studio    # Open Prisma Studio
```

### Code Quality
- **TypeScript**: Full type safety
- **ESLint**: Code linting with Next.js config
- **Prettier**: Code formatting (recommended)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful component library
- [Prisma](https://prisma.io/) - Next-generation ORM
- [dnd kit](https://dndkit.com/) - Drag and drop for React
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS

## 📞 Support

If you have any questions or need help, please:
1. Check the [Issues](https://github.com/pkgo1001/Kanban-NextJS-app/issues) page
2. Create a new issue if your problem isn't covered
3. Provide detailed information about your problem

---

**Built with ❤️ using Next.js and modern web technologies**