# COTH Mobile - Monorepo

> **Separate monorepo from EasyMate/Buela** with **separate database** (will migrate/link data later)

## 🎯 Overview

COTH Mobile is a **standalone Turborepo monorepo** for mobile application development. This is a completely separate codebase from `buela-all` (EasyMate) with its **own PostgreSQL database**. We will implement data migration/synchronization with EasyMate later as needed.

### Key Architecture Decisions

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Monorepo** | Separate from buela-all | Independent deployment and development |
| **Database** | Separate database (coth_mobile) | Independent evolution, simpler schema |
| **Backend** | NestJS REST + GraphQL API | Mobile-optimized endpoints |
| **Frontend** | React Native (TBD) | Native mobile experience |
| **Build Tool** | Turborepo | Fast, efficient builds |
| **Modules** | User + Auth only (MVP) | Start simple, add features incrementally |

---

## 📁 Monorepo Structure

```
coth-mobile/                          # Separate monorepo root
├── apps/
│   ├── api/                          # Backend API (NestJS)
│   │   ├── src/
│   │   │   ├── modules/              # Feature modules
│   │   │   │   ├── auth/            # ✅ Authentication (JWT, OAuth)
│   │   │   │   ├── user/            # ✅ User management
│   │   │   │   └── health/          # ✅ Health checks
│   │   │   │   # (Other modules TBD later)
│   │   │   ├── common/              # Shared utilities
│   │   │   │   ├── prisma/          # Database service
│   │   │   │   ├── filters/         # Exception filters
│   │   │   │   └── guards/          # Auth guards
│   │   │   ├── app.module.ts        # Root module
│   │   │   └── main.ts              # Entry point
│   │   ├── prisma/
│   │   │   └── schema.prisma        # Database schema (separate DB)
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── mobile/                       # Mobile App (React Native)
│       ├── src/                      # 📱 Frontend (TBD by FE team)
│       ├── package.json
│       └── README.md                 # Placeholder instructions
│
├── packages/                         # Shared packages (if needed)
│   └── (future shared code)
│
├── tooling/                          # Build tools and configs
│   └── (typescript configs, etc.)
│
├── package.json                      # Monorepo root
├── turbo.json                        # Turborepo configuration
├── .env.example                      # Environment template
└── README.md                         # This file
```

---

## 🔄 Database Architecture

### Separate Database Strategy

```
┌──────────────────────────────────────────────────────────────┐
│                    COTH Mobile Database                       │
│                  PostgreSQL (coth_mobile)                     │
│                                                              │
│  Tables: User, AuthProvider, Role                           │
│  (Simple MVP schema - will add more later)                  │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         │
                ┌────────▼──────────┐
                │   COTH Mobile     │
                │  (coth-mobile)    │
                │                   │
                │  REST/GraphQL     │
                │  API :3006        │
                │  React Native App │
                └───────────────────┘

     Data Migration/Sync with EasyMate (Planned for Later)
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                  EasyMate Database                            │
│                PostgreSQL (composer_db)                       │
│                                                              │
│  Tables: 97+ models (Agent, Collection, Workflow, etc.)     │
└────────────────────────┬─────────────────────────────────────┘
                         │
                ┌────────▼──────────┐
                │   EasyMate/Buela  │
                │   (buela-all)     │
                │                   │
                │  GraphQL API :3002│
                │  Next.js App :3000│
                └───────────────────┘

        Separate Databases - Different Applications
```

### Why Separate Database?

✅ **Benefits**:
- **Independent Evolution**: COTH can evolve without affecting EasyMate
- **Clear Boundaries**: Better separation of concerns
- **Simpler Schema**: Only 3 core models to start (User, AuthProvider, Role)
- **Easier Testing**: Can reset/test without affecting EasyMate
- **Performance Isolation**: COTH load won't impact EasyMate

📋 **Data Migration Strategy (Future)**:
- Option 1: Periodic ETL sync from EasyMate
- Option 2: API-based data access when needed
- Option 3: Event-driven sync via message queue
- Decision: TBD based on requirements

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20
- npm >= 10
- Docker Desktop
- PostgreSQL (via Docker)
- Git

### 1. Clone Repository

```bash
cd /path/to/projects
# If cloning from git
git clone <repo-url> coth-mobile
cd coth-mobile
```

### 2. Install Dependencies

```bash
# Install all workspace dependencies
npm install
```

### 3. Setup Database Infrastructure

**IMPORTANT**: Create a separate database for COTH Mobile

```bash
# Option 1: Use existing PostgreSQL from EasyMate infrastructure
cd ../buela-all
docker-compose -f docker-compose-infrastructure.yml up -d

# Then create the COTH Mobile database
docker exec -it <postgres_container_name> psql -U admin -c "CREATE DATABASE coth_mobile;"

# Option 2: Use your own PostgreSQL instance
psql -U postgres -c "CREATE DATABASE coth_mobile;"
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379 (optional)
- PgBouncer connection pooler (optional)

### 4. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env and ensure DATABASE_URL points to coth_mobile database
# DATABASE_URL="postgresql://admin:admin@localhost:5432/coth_mobile?schema=public"
```

### 5. Setup API

```bash
cd apps/api

# Copy API environment
cp .env.example .env

# Generate Prisma Client
npm run prisma:generate

# Run database migrations to create tables
npm run prisma:migrate:dev

# Start API development server
npm run dev
```

API will be available at:
- **API**: http://localhost:3006/api/v1
- **Swagger Docs**: http://localhost:3006/api/v1/docs
- **Health Check**: http://localhost:3006/api/v1/health

### 6. Mobile App (Future)

```bash
cd apps/mobile

# Setup will be added by frontend team
npm install
npm run dev
```

---

## 📊 API Modules Overview

### ✅ Implemented Modules (MVP)

| Module | Type | Description |
|--------|------|-------------|
| **Authentication** | REST + GraphQL | JWT + Google OAuth, register, login, refresh |
| **User Management** | REST + GraphQL | Get user, update user, delete user |
| **Health** | REST + GraphQL | Health checks, liveness, readiness |

**Status**: MVP with core user management and authentication

### 📋 Future Modules (TBD)

These will be added based on requirements:
- Profile Module (extended user information)
- Quota Module (usage tracking)
- Activity Module (activity feed)
- Other domain-specific modules

### API Module Details

#### 1. Authentication Module ([apps/api/src/modules/auth/](apps/api/src/modules/auth/))

**Responsibilities**:
- User registration with email/password
- Login with JWT tokens (access + refresh)
- Google OAuth 2.0 integration
- Token refresh mechanism
- Secure logout
- Password hashing with bcrypt

**API Types**: REST + GraphQL

**Components**:
- DTOs for REST endpoints
- Input types for GraphQL
- JWT strategies (access + refresh)
- Google OAuth strategy
- Auth guards for protected routes

#### 2. User Management Module ([apps/api/src/modules/user/](apps/api/src/modules/user/))

**Responsibilities**:
- Get current user profile
- Get user by UUID
- Update user information
- Delete user (soft delete)
- User CRUD operations

**API Types**: REST + GraphQL

**Components**:
- User entity with GraphQL decorators
- User service with business logic
- REST controller + GraphQL resolver

#### 3. Health Module ([apps/api/src/modules/health/](apps/api/src/modules/health/))

**Responsibilities**:
- Database connectivity check
- Memory usage monitoring
- Disk space monitoring
- Kubernetes-ready probes (liveness/readiness)

**API Types**: REST + GraphQL

**Components**:
- Health status entity
- Health check service
- REST controller + GraphQL resolver

---

## 🔧 Development

### Monorepo Commands

```bash
# From repository root

# Start all apps in development
npm run dev

# Build all apps
npm run build

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format

# Clean all builds
npm run clean
```

### API-Specific Commands

```bash
# Start API only
npm run api:dev

# Build API only
npm run api:build

# Test API
npm run api:test
```

### Mobile App Commands

```bash
# Start mobile app
npm run mobile:dev

# iOS development
npm run mobile:ios

# Android development
npm run mobile:android
```

---

## 🗄️ Database Connection

### Connection String

```bash
# Separate database for COTH Mobile
DATABASE_URL="postgresql://admin:admin@localhost:5432/coth_mobile?schema=public&connect_timeout=300"
```

### Database Tables (MVP)

The API starts with **3 core tables**:

- ✅ `User` - User accounts and authentication
- ✅ `AuthProvider` - OAuth provider information (Google, etc.)
- ✅ `Role` - User roles and permissions

**Enums**:
- `EnumUserRole` - PlatformAdmin, AccountOwner, AppAdmin, AppUser
- `EnumUserStatus` - Active, Deactivated, Suspended, Pending, Invited
- `EnumRegistrationReferralChannel` - PeerReferral, LinkedIn, etc.

### Prisma Schema

The Prisma schema is in [apps/api/prisma/schema.prisma](apps/api/prisma/schema.prisma).

**Schema Strategy**:
- Start simple with core models only
- Add new models as features are implemented
- Keep schema focused on mobile app needs
- Migrate/sync data from EasyMate later as needed

---

## 🐳 Docker Deployment

### Development

```bash
# Option 1: Use PostgreSQL from buela-all infrastructure
cd ../buela-all
docker-compose -f docker-compose-infrastructure.yml up -d

# Create COTH Mobile database
docker exec -it <postgres_container> psql -U admin -c "CREATE DATABASE coth_mobile;"

# Build and run COTH API
cd ../coth-mobile/apps/api
docker build -t coth-api:latest .
docker run -p 3006:3006 --env-file .env coth-api:latest
```

### Production

TBD - Will use Kubernetes, Cloud Run, or similar container orchestration

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| `/README.md` | This file - Monorepo overview |
| `/apps/api/README.md` | Complete API documentation |
| `/apps/api/SETUP.md` | API setup guide |
| `/apps/api/prisma/schema.prisma` | Database schema |
| `/apps/mobile/README.md` | Mobile app placeholder |

### API Documentation

- **Swagger UI**: http://localhost:3006/api/v1/docs
- **OpenAPI Spec**: Generated from code
- **Postman Collection**: Can be exported from Swagger

---

## 🔐 Security

- ✅ JWT Authentication with refresh tokens
- ✅ Google OAuth 2.0 integration
- ✅ Password hashing with bcrypt (salt: 10)
- ✅ Rate limiting (100 req/min per IP)
- ✅ Input validation with class-validator
- ✅ CORS configuration
- ✅ Environment-based secrets
- ✅ Sentry error tracking (configured)

---

## 🧪 Testing

```bash
# Run all tests
npm run test

# API unit tests
npm run api:test

# API E2E tests
cd apps/api
npm run test:e2e

# Mobile tests (TBD)
npm run mobile:test
```

---

## 🚧 Project Status

### ✅ Completed (MVP)

- ✅ Monorepo structure with Turborepo
- ✅ Backend API with NestJS (REST + GraphQL)
- ✅ 3 core API modules (Auth, User, Health)
- ✅ Separate database setup (coth_mobile)
- ✅ JWT + Google OAuth authentication
- ✅ Simplified schema (User, AuthProvider, Role)
- ✅ Docker support
- ✅ Health monitoring
- ✅ GraphQL playground

### 🔄 In Progress

- [ ] User management feature implementation
- [ ] Authentication flow testing
- [ ] Mobile app development (Frontend team)

### 📋 TODO (Priority)

1. **Backend Development**:
   - [ ] Implement user registration endpoint
   - [ ] Implement login endpoint
   - [ ] Implement user CRUD operations
   - [ ] Add comprehensive tests
   - [ ] Setup database migrations

2. **Frontend Development**:
   - [ ] Setup React Native project
   - [ ] Implement authentication screens
   - [ ] Build user profile screens
   - [ ] API integration

3. **Infrastructure**:
   - [ ] Configure CI/CD pipeline
   - [ ] Setup staging environment
   - [ ] Production deployment strategy

4. **Future Features** (TBD):
   - [ ] Profile module (extended user data)
   - [ ] Quota module (usage tracking)
   - [ ] Activity module (feed)
   - [ ] Data migration from EasyMate
   - [ ] Push notifications
   - [ ] Real-time updates (WebSocket)
   - [ ] Analytics tracking

---

## 📞 Team & Contact

### Backend Team
- API implementation
- Database schema
- Authentication
- Module development

### Frontend Team
- React Native mobile app
- UI/UX implementation
- API integration
- Mobile-specific features

---

## 🔗 Related Projects

| Project | Location | Description |
|---------|----------|-------------|
| **EasyMate/Buela** | `../buela-all` | Main platform (shared database) |
| **COTH Mobile** | `./` (this repo) | Mobile application |

---

## 🎯 Next Steps

1. **Backend**:
   - ✅ API infrastructure complete
   - Add comprehensive tests
   - Configure production deployment

2. **Frontend**:
   - Setup React Native project
   - Implement authentication flow
   - Build core screens
   - Integrate with API

3. **DevOps**:
   - Setup CI/CD pipeline
   - Configure staging environment
   - Production deployment strategy

---

## 📊 Statistics

| Metric | Value |
|--------|-------|
| **Monorepo Apps** | 2 (API + Mobile) |
| **API Modules** | 3 (Auth, User, Health) |
| **API Types** | REST + GraphQL |
| **Database Tables** | 3 (User, AuthProvider, Role) |
| **Database Strategy** | Separate DB (coth_mobile) |
| **TypeScript Files** | 30+ |
| **Architecture** | NestJS + Prisma ORM |

---

**Version**: 0.1.0 (MVP)
**Status**: MVP Structure Ready - Implementation in Progress
**Last Updated**: 2025-10-23
