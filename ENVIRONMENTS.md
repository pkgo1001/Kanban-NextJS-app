# 🌍 Multi-Environment Setup Guide

This project supports three separate environments: **Development**, **QA/Staging**, and **Production**.

## 📋 Environment Overview

| Environment | Branch | Port | Database | Purpose |
|-------------|--------|------|----------|---------|
| **Development** | `develop` | 3000 | `dev.db` | Active development |
| **QA/Staging** | `staging` | 3001 | `qa.db` | Testing before production |
| **Production** | `main` | 3002 | `prod.db` | Production-ready code |

## 🗂️ File Structure

```
.env.development    # Dev environment config (git ignored)
.env.qa            # QA environment config (git ignored)
.env.production    # Production environment config (git ignored)
.env.example       # Template for environment files (committed)

prisma/
  ├── dev.db       # Development database (git ignored)
  ├── qa.db        # QA database (git ignored)
  └── prod.db      # Production database (git ignored)
```

## 🚀 Running Different Environments Locally

### Development Environment (Port 3000)
```bash
npm run dev              # Run dev server
npm run db:studio        # Open Prisma Studio for dev DB
npm run db:seed          # Seed dev database
npm run db:reset         # Reset dev database
```

### QA Environment (Port 3001)
```bash
npm run dev:qa           # Run QA server
npm run db:studio:qa     # Open Prisma Studio for QA DB (port 5556)
npm run db:seed:qa       # Seed QA database
npm run db:reset:qa      # Reset QA database
npm run db:migrate:qa    # Run migrations on QA DB
```

### Production Environment (Port 3002)
```bash
npm run dev:prod         # Run prod server locally
npm run db:studio:prod   # Open Prisma Studio for prod DB (port 5557)
npm run db:seed:prod     # Seed prod database
npm run db:reset:prod    # Reset prod database
npm run db:migrate:prod  # Run migrations on prod DB
```

## 🔄 Git Workflow

### Feature Development
```bash
# 1. Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# 2. Make changes and commit
git add .
git commit -m "feat: your feature description"

# 3. Push and create PR to develop
git push origin feature/your-feature-name
```

### Promoting to QA
```bash
# Merge develop into staging
git checkout staging
git merge develop
git push origin staging
```

### Promoting to Production
```bash
# Merge staging into main
git checkout main
git merge staging
git push origin main
```

## 🔧 Environment Variables

Each environment file contains:

```env
DATABASE_URL="file:./[env].db"
NODE_ENV="development|production"
NEXT_PUBLIC_API_URL="http://localhost:[port]"
JWT_SECRET="your-secret-key"
```

### Important Notes:
- ⚠️ **Never commit actual `.env.*` files** (except `.env.example`)
- ⚠️ **Change JWT_SECRET** in production deployments
- ⚠️ **Database URLs** should use hosted databases (PostgreSQL) in deployed environments

## 🌐 GitHub Environments Setup

### Step 1: Create GitHub Environments

1. Go to your repository: `https://github.com/pkgo1001/Kanban-NextJS-app`
2. Navigate to **Settings** → **Environments**
3. Click **New environment** and create three environments:
   - **development**
   - **staging** 
   - **production**

### Step 2: Configure Environment Protection Rules

#### Production Environment
1. Select **production** environment
2. Enable **Required reviewers** (add yourself or team members)
3. Enable **Wait timer** (optional, e.g., 5 minutes)
4. Add **Deployment branches**: Only `main` branch

#### Staging Environment
1. Select **staging** environment
2. Add **Deployment branches**: Only `staging` branch
3. (Optional) Enable required reviewers

#### Development Environment
1. Select **development** environment
2. Add **Deployment branches**: Only `develop` branch

### Step 3: Add Environment Secrets

For each environment, add these secrets:

1. Go to **Settings** → **Environments** → Select environment
2. Click **Add secret** for each:

```
DATABASE_URL          # For deployed databases (e.g., Railway, Supabase)
JWT_SECRET            # Unique per environment
NEXT_PUBLIC_API_URL   # Your deployment URL
```

**Example values:**
- **Development**: `https://kanban-dev.vercel.app`
- **Staging**: `https://kanban-staging.vercel.app`
- **Production**: `https://kanban.vercel.app`

## 🚢 Deployment Configuration

### Vercel (Recommended)

1. **Connect Repository** to Vercel
2. **Create 3 Projects**:
   - `kanban-dev` (connected to `develop` branch)
   - `kanban-staging` (connected to `staging` branch)
   - `kanban-prod` (connected to `main` branch)

3. **For each project**, add environment variables:
   ```
   DATABASE_URL
   JWT_SECRET
   NEXT_PUBLIC_API_URL
   NODE_ENV
   ```

4. **Database Setup** (per environment):
   - Use Vercel Postgres, Railway, or Supabase
   - Create separate database for each environment

### Railway (Alternative)

1. Create 3 projects: `kanban-dev`, `kanban-staging`, `kanban-prod`
2. Connect each to respective branch
3. Add PostgreSQL plugin to each
4. Set environment variables

## 📊 Database Management

### Local Development
- SQLite databases stored in `prisma/` folder
- Separate file per environment
- Easy to reset and re-seed

### Deployed Environments
- Use PostgreSQL or MySQL
- Separate hosted database per environment
- Update `DATABASE_URL` in environment secrets

### Migration Strategy

```bash
# Development: Create and apply migrations
npm run db:migrate:dev

# QA: Deploy migrations
npm run db:migrate:qa

# Production: Deploy migrations (after QA approval)
npm run db:migrate:prod
```

## 🧪 Testing Workflow

1. **Develop** → Create features in `develop` branch
2. **QA** → Merge to `staging` for testing
3. **Production** → After QA approval, merge to `main`

## 🔒 Security Best Practices

✅ Use different JWT secrets per environment
✅ Never commit `.env.*` files (except `.env.example`)
✅ Use separate databases per environment
✅ Enable branch protection on `main` and `staging`
✅ Require PR reviews before merging to production
✅ Use environment secrets in CI/CD

## 📝 Quick Reference

### Switching Environments
```bash
git checkout develop   # Development
git checkout staging   # QA
git checkout main      # Production
```

### Running Servers Simultaneously
```bash
# Terminal 1: Development
npm run dev

# Terminal 2: QA
npm run dev:qa

# Terminal 3: Production
npm run dev:prod
```

### Viewing Databases Simultaneously
```bash
# Terminal 1: Dev DB
npm run db:studio

# Terminal 2: QA DB
npm run db:studio:qa

# Terminal 3: Prod DB
npm run db:studio:prod
```

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Kill process on port
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
lsof -ti:3002 | xargs kill -9
```

### Database Issues
```bash
# Reset specific environment database
npm run db:reset         # Dev
npm run db:reset:qa      # QA
npm run db:reset:prod    # Prod
```

### Environment Variables Not Loading
```bash
# Verify environment file exists and has correct values
cat .env.development
cat .env.qa
cat .env.production
```

## 📚 Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Prisma Multiple Environments](https://www.prisma.io/docs/guides/deployment/deployment-guides)
- [GitHub Environments Documentation](https://docs.github.com/en/actions/deployment/targeting-different-environments)

##
All seeded test users (Sarah Chen, John Smith, etc.) exist in all three databases with various roles for RBAC testing
Password for all seeded users: password123
Password for all admin users: admin123