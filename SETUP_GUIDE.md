# 🚀 Setup Guide - Sanctum Backend

**Goal:** Get the API running with a working database  
**Estimated Time:** 15-30 minutes depending on your setup choice

---

## 📋 Prerequisites Check

```bash
# Node.js and npm
node --version  # Need v18+
npm --version

# PostgreSQL
psql --version  # Optional - only if doing local setup

# Docker
docker --version  # Optional - for containerized setup
docker-compose --version
```

---

## 🎯 Choose Your Setup Path

### **Option 1: Supabase (Recommended - Fastest) ⚡**

**Pros:** Hosted, no local setup, free tier available  
**Cons:** Requires internet connection, external dependency

#### Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Sign up for free account
3. Create a new project
4. Wait for it to initialize (2-3 minutes)

#### Step 2: Get Connection String
1. Go to **Settings** → **Database** → **Connection Pooling**
2. Copy the connection string
3. Update `.env` file:
```bash
DATABASE_URL="postgresql://[user]:[password]@[host]:5432/[database]?schema=public"
```

#### Step 3: Run Migrations
```bash
cd apps/api
npx prisma migrate deploy
npx prisma db seed
```

#### Step 4: Verify Connection
```bash
npx prisma studio  # Opens web UI to view database
```

✅ Done! Skip to [Start the API](#start-the-api)

---

### **Option 2: Docker (Recommended for Development) 🐳**

**Pros:** Isolated environment, matches production, portable  
**Cons:** Requires Docker Desktop

#### Step 1: Install Docker Desktop

**Windows:**
- Download: https://www.docker.com/products/docker-desktop
- Install and restart computer
- Enable Windows Subsystem for Linux (WSL 2)

**Mac:**
- Download: https://www.docker.com/products/docker-desktop
- Install and restart

**Linux:**
```bash
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo usermod -aG docker $USER
# Log out and back in
```

#### Step 2: Verify Docker Installation
```bash
docker --version
docker-compose --version
docker run hello-world
```

#### Step 3: Start Database Services
```bash
cd c:/www/mguibtech/projects/Sanctum/sanctum
docker-compose up -d

# Check status
docker-compose ps
```

You should see:
```
sanctum-postgres  postgres:16-alpine  Up (healthy)
sanctum-redis     redis:7-alpine      Up (healthy)
```

#### Step 4: Wait for Database Ready
```bash
# Wait for health checks (about 30 seconds)
docker-compose logs postgres | grep "database system is ready"
```

#### Step 5: Run Migrations
```bash
cd apps/api
npx prisma migrate deploy
npx prisma db seed
```

#### Step 6: Verify Connection
```bash
npx prisma studio
```

✅ Database ready! Skip to [Start the API](#start-the-api)

---

### **Option 3: PostgreSQL Local Installation 🖥️**

**Pros:** No Docker/cloud dependency, full control  
**Cons:** Takes longer to set up, more manual steps

#### Windows Setup

##### Step 1: Download and Install PostgreSQL
1. Go to https://www.postgresql.org/download/windows/
2. Download PostgreSQL 14+ installer
3. Run installer:
   - Choose installation directory
   - Set password for `postgres` user (remember this!)
   - Port: **5432**
   - Default locale is fine
   - Complete installation

##### Step 2: Add PostgreSQL to PATH
```bash
# PowerShell (as Administrator)
$env:Path += ";C:\Program Files\PostgreSQL\16\bin"
```

##### Step 3: Create Database
```bash
# Open Command Prompt as Administrator
createdb -U postgres -h localhost sanctum

# Verify
psql -U postgres -h localhost -l | grep sanctum
```

##### Step 4: Update .env
```bash
# Update DATABASE_URL in apps/api/.env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/sanctum?schema=public"
```

#### macOS Setup

```bash
# Install via Homebrew
brew install postgresql@16

# Start PostgreSQL service
brew services start postgresql@16

# Create database
createdb sanctum

# Verify
psql -l | grep sanctum
```

#### Linux Setup

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres createdb sanctum

# Create user (optional, if not postgres)
sudo -u postgres createuser sanctum --createdb
sudo -u postgres psql -c "ALTER USER sanctum WITH PASSWORD 'sanctum';"
```

#### Step 5: Run Migrations
```bash
cd apps/api
npx prisma migrate deploy
npx prisma db seed
```

#### Step 6: Verify
```bash
psql -U postgres -h localhost -d sanctum -c "SELECT COUNT(*) FROM users;"
```

✅ Database ready! Continue to [Start the API](#start-the-api)

---

## ▶️ Start the API

### Terminal 1: Start Development Server

```bash
cd c:/www/mguibtech/projects/Sanctum/sanctum/apps/api

# Start in watch mode (auto-reload on code changes)
npm run start:dev

# Expected output:
# [Nest] 12345  - 04/10/2026 10:30:00 LOG [NestFactory] Starting Nest application...
# [Nest] 12345  - 04/10/2026 10:30:01 LOG [RoutesResolver] AppController {...}
# [Nest] 12345  - 04/10/2026 10:30:02 LOG [NestApplication] Nest application successfully started
```

The API is now running at **http://localhost:3000**

### Verify API is Running

```bash
# In a new terminal
curl http://localhost:3000/health 2>/dev/null || echo "API not responding"

# Or test authentication
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User"
  }'
```

---

## 🗄️ View Database

### Option A: Prisma Studio (Recommended)

```bash
cd apps/api
npx prisma studio

# Opens http://localhost:5555 in your browser
```

### Option B: pgAdmin (PostgreSQL GUI)

For Docker setup, add to `docker-compose.yml`:
```yaml
pgadmin:
  image: dpage/pgadmin4:latest
  container_name: sanctum-pgadmin
  environment:
    PGADMIN_DEFAULT_EMAIL: admin@example.com
    PGADMIN_DEFAULT_PASSWORD: admin
  ports:
    - "5050:80"
```

Then start: `docker-compose up -d`
Access: http://localhost:5050

### Option C: Command Line

```bash
# Connect to database
psql -U sanctum -h localhost -d sanctum

# View tables
\dt

# View users
SELECT id, email, name, created_at FROM users;

# Exit
\q
```

---

## 🧪 Test the API

### 1. Register a User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "João Silva"
  }'
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Save the Token
```bash
TOKEN="your_access_token_here"
```

### 3. Test Protected Endpoint
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

Response:
```json
{
  "id": "clv2xyz...",
  "email": "user@example.com",
  "name": "João Silva",
  "onboardingCompleted": false,
  "createdAt": "2026-04-10T..."
}
```

### 4. Complete Onboarding
```bash
curl -X POST http://localhost:3000/auth/onboarding \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "preferredFormat": "AUDIO",
    "sessionLength": "MEDIUM",
    "focusArea": "PEACE",
    "experienceLevel": "BEGINNER",
    "interests": ["LENT", "NOVENA"],
    "notifyMorning": true,
    "notifyNight": true,
    "timezone": "America/Sao_Paulo"
  }'
```

### 5. Test Bible Endpoint
```bash
curl -X GET "http://localhost:3000/bible/books" \
  -H "Authorization: Bearer $TOKEN"
```

✅ All working!

---

## 🛠️ Useful Commands

### Database Commands
```bash
# Reset entire database (⚠️ deletes all data)
npx prisma migrate reset

# Create new migration from schema changes
npx prisma migrate dev --name add_new_field

# Apply pending migrations
npx prisma migrate deploy

# View migration status
npx prisma migrate status

# Open database studio
npx prisma studio
```

### Git Commands
```bash
# Commit your work
git add .
git commit -m "your message"

# View logs
git log --oneline -10

# Check status
git status
```

### Docker Commands (if using docker-compose)
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f postgres

# Rebuild containers
docker-compose up -d --build
```

---

## ❌ Troubleshooting

### "Can't reach database server"
```bash
# Check if database is running
# For Docker: docker-compose ps
# For local: psql -U postgres -h localhost -c "SELECT 1;"
# For Supabase: Check your internet connection
```

### "Port 5432/55432 already in use"
```bash
# Find process using port
lsof -i :5432  # macOS/Linux
netstat -ano | findstr :5432  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### "Authentication failed"
```bash
# Check .env file DATABASE_URL
# Make sure username and password match your setup
# Test connection:
psql -U sanctum -h localhost -d sanctum
```

### "Migrations failed"
```bash
# Check migration status
npx prisma migrate status

# Reset if needed (⚠️ deletes data)
npx prisma migrate reset

# Reapply migrations
npx prisma migrate deploy
```

### "Module not found" error
```bash
# Reinstall dependencies
rm -rf node_modules yarn.lock
yarn install

# Or npm
rm -rf node_modules package-lock.json
npm install
```

---

## ✅ Setup Checklist

- [ ] Node.js v18+ installed
- [ ] Git configured
- [ ] Database chosen (Supabase / Docker / Local PostgreSQL)
- [ ] Database running and accessible
- [ ] `.env` file updated with DATABASE_URL
- [ ] Migrations applied: `npx prisma migrate deploy`
- [ ] Seed data loaded: `npx prisma db seed`
- [ ] API started: `npm run start:dev`
- [ ] API responding on http://localhost:3000
- [ ] User registration working
- [ ] Protected endpoints accessible with token

---

## 🎯 Next Steps

1. ✅ **Setup Complete** - Database and API running
2. 📱 **Mobile Integration** - Connect React Native app to API
3. 🧪 **Integration Testing** - Test all endpoints
4. 🚀 **Deployment** - Deploy to production server

---

## 📚 Resources

- **Prisma Docs:** https://www.prisma.io/docs/
- **NestJS Docs:** https://docs.nestjs.com/
- **API Reference:** See `API_REFERENCE.md`
- **Test Plan:** See `TEST_PLAN.md`

---

**Status:** Ready to set up! Choose an option above and follow the steps.

