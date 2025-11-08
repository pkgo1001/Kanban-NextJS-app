# 🚀 Deployment Guide

This guide covers multiple deployment options for the Kanban NextJS application, from simple one-click deployments to advanced custom server setups.

## 📋 Table of Contents
- [Quick Deployment (Recommended)](#quick-deployment-recommended)
- [Vercel Deployment](#vercel-deployment)
- [Railway Deployment](#railway-deployment)
- [Netlify Deployment](#netlify-deployment)
- [Traditional Server Deployment](#traditional-server-deployment)
- [Docker Deployment](#docker-deployment)
- [Database Configuration](#database-configuration)
- [Environment Variables](#environment-variables)
- [Domain Setup](#domain-setup)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Deployment (Recommended)

### Vercel - One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/pkgo1001/Kanban-NextJS-app)

**Why Vercel?**
- Built by the creators of Next.js
- Zero configuration for Next.js apps
- Automatic HTTPS and CDN
- Edge functions and optimizations
- Free tier available

---

## 🔷 Vercel Deployment

### Method 1: GitHub Integration (Recommended)

1. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with your GitHub account
   - Click "New Project"
   - Import `pkgo1001/Kanban-NextJS-app`

2. **Configure Project**
   ```
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   Development Command: npm run dev
   ```

3. **Environment Variables**
   Add these in the Vercel dashboard:
   ```env
   DATABASE_URL=file:./prisma/prod.db
   NEXTAUTH_SECRET=your-super-secret-key-for-production
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - Your app will be live at `https://your-app.vercel.app`

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to your account
vercel login

# Deploy from your project directory
cd /path/to/Kanban-NextJS-app
vercel

# Follow the prompts:
# ? Set up and deploy "~/Kanban-NextJS-app"? [Y/n] y
# ? Which scope do you want to deploy to? [Your Account]
# ? Link to existing project? [y/N] n
# ? What's your project's name? kanban-nextjs-app
# ? In which directory is your code located? ./

# Production deployment
vercel --prod
```

### Continuous Deployment
Once connected to GitHub, Vercel will automatically:
- Deploy on every push to `main` branch
- Deploy preview builds for pull requests
- Update environment variables without redeployment

---

## 🚂 Railway Deployment

Railway offers simple deployment with built-in databases.

### Step 1: Setup Railway

1. **Create Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `pkgo1001/Kanban-NextJS-app`

### Step 2: Configure Environment

```env
# Railway automatically detects Next.js
# Add these environment variables in Railway dashboard:

DATABASE_URL=file:./prisma/railway.db
NEXTAUTH_SECRET=your-railway-production-secret
PORT=3000
```

### Step 3: Database Setup

Railway provides PostgreSQL databases:

```bash
# Update your schema for PostgreSQL
# In prisma/schema.prisma, change:
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}

# Railway will provide a DATABASE_URL like:
# postgresql://username:password@hostname:port/database
```

### Step 4: Deploy

```bash
# Railway automatically builds with:
# Build Command: npm run build
# Start Command: npm start

# Your app will be available at:
# https://your-app.up.railway.app
```

---

## 🌐 Netlify Deployment

Netlify is great for static sites and serverless functions.

### Step 1: Build Configuration

Create `netlify.toml` in your project root:

```toml
[build]
  publish = ".next"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  directory = ".netlify/functions/"
```

### Step 2: Deploy Options

**Option A: Git Integration**
1. Connect GitHub repository to Netlify
2. Set build settings:
   ```
   Build command: npm run build
   Publish directory: .next
   ```

**Option B: Netlify CLI**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Production deploy
netlify deploy --prod
```

**Note**: Netlify has limitations with Next.js API routes. Consider using Netlify Functions for backend functionality.

---

## 🖥️ Traditional Server Deployment

Deploy to your own server (VPS, AWS EC2, etc.)

### Prerequisites
- Ubuntu 20.04+ or similar Linux distribution
- Node.js 18+
- PM2 for process management
- Nginx for reverse proxy

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx
```

### Step 2: Application Deployment

```bash
# Clone your repository
git clone https://github.com/pkgo1001/Kanban-NextJS-app.git
cd Kanban-NextJS-app

# Install dependencies
npm install

# Build the application
npm run build

# Setup database
npx prisma generate
npx prisma db push

# Create production environment file
nano .env.local
```

### Step 3: PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'kanban-app',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    instances: 'max',
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
  }]
}
```

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Step 4: Nginx Configuration

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/kanban-app
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/kanban-app /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable automatic startup
sudo systemctl enable nginx
```

### Step 5: SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🐳 Docker Deployment

### Step 1: Create Dockerfile

Create `Dockerfile` in project root:

```dockerfile
# Use the official Node.js runtime as base image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Step 2: Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=file:./prisma/docker.db
      - NEXTAUTH_SECRET=your-docker-secret
    volumes:
      - ./prisma:/app/prisma
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: kanban
      POSTGRES_USER: kanban_user
      POSTGRES_PASSWORD: kanban_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### Step 3: Deploy with Docker

```bash
# Build and run
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## 🗄️ Database Configuration

### SQLite (Development/Small Production)
```env
DATABASE_URL="file:./prisma/prod.db"
```

### PostgreSQL (Recommended for Production)
```env
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
```

### MySQL
```env
DATABASE_URL="mysql://username:password@host:port/database"
```

### Database Migration for Production

```bash
# For new deployments
npx prisma generate
npx prisma db push

# For existing deployments with data
npx prisma migrate deploy

# Seed production database (optional)
npm run db:seed
```

---

## 🔐 Environment Variables

### Required Variables

```env
# Database
DATABASE_URL="your-database-connection-string"

# Authentication
NEXTAUTH_SECRET="your-super-secret-key-minimum-32-characters"

# Optional: Custom domain
NEXTAUTH_URL="https://yourdomain.com"
```

### Generating Secrets

```bash
# Generate a secure secret
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Platform-Specific Setup

**Vercel**
```bash
vercel env add NEXTAUTH_SECRET
vercel env add DATABASE_URL
```

**Railway**
- Add in Railway dashboard under "Variables"

**Netlify**
- Add in Site settings → Environment variables

---

## 🌐 Domain Setup

### Custom Domain with Vercel

1. **Add Domain in Vercel Dashboard**
   - Go to Project Settings → Domains
   - Add your domain name

2. **Configure DNS**
   ```
   Type: CNAME
   Name: www (or @)
   Value: cname.vercel-dns.com
   
   Type: A
   Name: @
   Value: 76.76.19.61
   ```

### Custom Domain with Railway

1. **Add Domain in Railway**
   - Go to Project → Settings → Domains
   - Add custom domain

2. **Configure DNS**
   ```
   Type: CNAME
   Name: your-subdomain
   Value: your-app.up.railway.app
   ```

---

## 🚨 Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be 18+
```

**Database Issues**
```bash
# Reset database
npx prisma migrate reset

# Regenerate Prisma client
npx prisma generate

# Check database connection
npx prisma db push
```

**Environment Variables Not Working**
```bash
# Check if .env.local exists
ls -la | grep env

# Verify variable names (no spaces, correct case)
cat .env.local

# Restart development server
npm run dev
```

### Platform-Specific Issues

**Vercel**
- Check build logs in Vercel dashboard
- Ensure environment variables are set correctly
- Verify build command and output directory

**Railway**
- Check deployment logs
- Verify Dockerfile if using custom deployment
- Check resource usage limits

**Docker**
```bash
# Check container logs
docker logs container-name

# Enter container for debugging
docker exec -it container-name sh

# Check if app is running
docker ps
```

### Performance Optimization

**Next.js Optimizations**
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  compress: true,
  poweredByHeader: false,
}

module.exports = nextConfig
```

**Database Optimizations**
```prisma
// Add indexes to frequently queried fields
model Task {
  id     String @id @default(cuid())
  status Status @default(TODO)
  
  @@index([status])
  @@index([createdAt])
}
```

---

## 📞 Support

If you encounter issues during deployment:

1. **Check the logs** in your deployment platform
2. **Verify environment variables** are correctly set
3. **Test locally first** with `npm run build && npm start`
4. **Create an issue** on [GitHub](https://github.com/pkgo1001/Kanban-NextJS-app/issues)

---

**Happy Deploying! 🚀**
