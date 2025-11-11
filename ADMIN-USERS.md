# 👤 Admin Users - Environment Credentials

This document contains the admin user credentials for each environment.

**⚠️ IMPORTANT SECURITY NOTES:**
- These are default passwords for development/learning purposes
- **CHANGE THESE PASSWORDS** before any public deployment
- Never commit actual `.env.*` files with production credentials
- This file is for reference only and should not be committed to production branches

---

## 🔐 Admin Credentials by Environment

### Development Environment
- **Email:** `admin.dev@company.com`
- **Password:** `admin123`
- **Name:** Admin Dev
- **Role:** ADMIN
- **Access:** http://localhost:3000

**Run Development:**
```bash
npm run dev
npm run db:studio  # View database on http://localhost:5555
```

---

### QA/Staging Environment
- **Email:** `admin.qa@company.com`
- **Password:** `admin123`
- **Name:** Admin QA
- **Role:** ADMIN
- **Access:** http://localhost:3001

**Run QA:**
```bash
npm run dev:qa
npm run db:studio:qa  # View database on http://localhost:5556
```

---

### Production Environment
- **Email:** `admin.prd@company.com`
- **Password:** `admin123`
- **Name:** Admin Production
- **Role:** ADMIN
- **Access:** http://localhost:3002

**Run Production:**
```bash
npm run dev:prod
npm run db:studio:prod  # View database on http://localhost:5557
```

---

## 🎭 Testing RBAC with Different Roles

Each environment also has seeded users with different roles for testing:

### Existing Test Users (from seed data)
| Email | Role | Purpose |
|-------|------|---------|
| emma.davis@company.com* | ADMIN | Full access |
| alex.rodriguez@company.com | SUPERVISOR | Manage tasks |
| sarah.chen@company.com | EMPLOYEE | Assigned tasks only |
| john.smith@company.com | VIEWER | Read-only access |
| david.park@company.com | EMPLOYEE | Assigned tasks only |

*Note: Emma Davis exists only in Development database

**All seeded users have password:** `password123`

---

## 🔄 Creating Admin Users for New Environments

If you reset a database or create a new environment, use these commands:

```bash
# Development
npm run db:create-admin

# QA
npm run db:create-admin:qa

# Production
npm run db:create-admin:prod
```

---

## 🛠️ Admin User Script

The admin users are created by the script: `scripts/create-admin-users.ts`

**Features:**
- Automatically detects environment from DATABASE_URL
- Creates both Assignee and User records
- Assigns ADMIN role
- Checks for existing users to avoid duplicates
- Uses bcrypt for password hashing

---

## 🔒 Security Best Practices

### For Development/Learning:
✅ Use simple passwords like `admin123`
✅ Keep this file for reference
✅ Commit admin creation scripts

### For Production Deployment:
❌ Never use default passwords
❌ Never commit this file to production branches
❌ Never expose credentials in environment variables in public repos

### Recommended Production Setup:
1. Use environment variables for admin credentials
2. Generate strong passwords (16+ characters)
3. Use unique JWT_SECRET per environment
4. Enable 2FA/MFA for admin accounts
5. Use hosted databases (PostgreSQL) instead of SQLite
6. Implement password reset functionality
7. Add audit logging for admin actions

---

## 📊 Verification

To verify admin users exist in each database:

```bash
# Check Development
sqlite3 prisma/dev.db "SELECT email, name, role FROM users WHERE role = 'ADMIN';"

# Check QA
sqlite3 prisma/qa.db "SELECT email, name, role FROM users WHERE role = 'ADMIN';"

# Check Production
sqlite3 prisma/prod.db "SELECT email, name, role FROM users WHERE role = 'ADMIN';"
```

---

## 🔄 Resetting Admin Passwords

If you need to reset an admin password:

1. **Option 1: Use Prisma Studio**
   ```bash
   npm run db:studio      # For dev
   npm run db:studio:qa   # For QA
   npm run db:studio:prod # For prod
   ```
   - Navigate to the `users` table
   - Find the admin user
   - Update the password field (will need to hash it)

2. **Option 2: Delete and Recreate**
   ```bash
   # Delete the admin user in Prisma Studio
   # Then run:
   npm run db:create-admin      # For dev
   npm run db:create-admin:qa   # For QA
   npm run db:create-admin:prod # For prod
   ```

3. **Option 3: Reset Entire Database**
   ```bash
   npm run db:reset      # Resets dev DB
   npm run db:reset:qa   # Resets QA DB
   npm run db:reset:prod # Resets prod DB
   
   # Then recreate admin:
   npm run db:create-admin      # For dev
   npm run db:create-admin:qa   # For QA
   npm run db:create-admin:prod # For prod
   ```

---

## 📝 Quick Reference

### Login URLs (Local Development)
- Dev: http://localhost:3000/login
- QA: http://localhost:3001/login
- Prod: http://localhost:3002/login

### Database Viewers (Prisma Studio)
- Dev: http://localhost:5555
- QA: http://localhost:5556
- Prod: http://localhost:5557

### Admin Emails
- Dev: `admin.dev@company.com`
- QA: `admin.qa@company.com`
- Prod: `admin.prd@company.com`

### Default Password
All admin users: `admin123`

---

**Last Updated:** November 11, 2025
**Created By:** Multi-environment setup script

