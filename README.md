# COTH Mobile - Monorepo

> **Separate monorepo from EasyMate/Buela** with **shared database infrastructure**

## 🎯 Overview

COTH Mobile is a **standalone Turborepo monorepo** for mobile application development. While it's a separate codebase from `buela-all` (EasyMate), the backend API connects to the **same PostgreSQL database** to avoid data duplication and maintain a single source of truth.

### Key Architecture Decisions

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Monorepo** | Separate from buela-all | Independent deployment and development |
| **Database** | Shared with EasyMate | No data duplication, single source of truth |
| **Backend** | NestJS REST API | Mobile-optimized endpoints |
| **Frontend** | React Native (TBD) | Native mobile experience |
| **Build Tool** | Turborepo | Fast, efficient builds |

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
│   │   │   │   ├── profile/         # ✅ User profile
│   │   │   │   ├── quota/           # ✅ Quota tracking
│   │   │   │   ├── activity/        # ✅ Activity feed
│   │   │   │   └── health/          # ✅ Health checks
│   │   │   ├── common/              # Shared utilities
│   │   │   │   ├── prisma/          # Database service
│   │   │   │   ├── filters/         # Exception filters
│   │   │   │   └── guards/          # Auth guards
│   │   │   ├── app.module.ts        # Root module
│   │   │   └── main.ts              # Entry point
│   │   ├── prisma/
│   │   │   └── schema.prisma        # Database schema (shared with EasyMate)
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

### Shared Database Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                     PostgreSQL Database                      │
│                    (composer_db on :5432)                    │
│                                                              │
│  Tables: User, Company, Agent, Collection, Quota, etc.      │
└─────────────────────┬───────────────────┬───────────────────┘
                      │                   │
        ┌─────────────┴────────┐    ┌─────┴──────────────┐
        │   EasyMate/Buela     │    │   COTH Mobile      │
        │     (buela-all)      │    │   (coth-mobile)    │
        │                      │    │                    │
        │  GraphQL API :3002   │    │  REST API :3006    │
        │  Next.js App :3000   │    │  React Native App  │
        └──────────────────────┘    └────────────────────┘

        Same Database - Different Applications
```

### Why Shared Database?

✅ **Pros**:
- No data migration or sync required
- Single source of truth for user data
- Instant access to all EasyMate features
- No data duplication
- Consistent data across platforms

❌ **No Cons** for this use case:
- Both apps are internal, same team
- Independent scaling still possible
- Database is already multi-tenant ready

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

**IMPORTANT**: Use the existing database from EasyMate/Buela

```bash
# From buela-all directory (EasyMate project)
cd ../buela-all
docker-compose -f docker-compose-infrastructure.yml up -d
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379
- PgBouncer connection pooler

### 4. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env and ensure DATABASE_URL matches EasyMate database
# DATABASE_URL="postgresql://admin:admin@localhost:5432/composer_db?schema=public"
```

### 5. Setup API

```bash
cd apps/api

# Copy API environment
cp .env.example .env

# Generate Prisma Client
npm run prisma:generate

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

### ✅ Implemented Modules

| Module | Endpoints | Description |
|--------|-----------|-------------|
| **Authentication** | 7 endpoints | JWT + Google OAuth, register, login, refresh |
| **User Management** | 3 endpoints | Get user, delete user |
| **Profile** | 4 endpoints | Get/update profile, welcome flow |
| **Quota** | 2 endpoints | Quota info, quota events |
| **Activity** | 3 endpoints | Activity feed, conversations, collections |
| **Health** | 3 endpoints | Health checks, liveness, readiness |

**Total: 22 REST API endpoints**

### API Module Details

#### 1. Authentication Module (`apps/api/src/modules/auth/`)
- ✅ User registration with email/password
- ✅ Login with JWT tokens (access + refresh)
- ✅ Google OAuth 2.0 integration
- ✅ Token refresh mechanism
- ✅ Secure logout
- ✅ Password hashing with bcrypt

**Endpoints**:
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/auth/google
GET    /api/v1/auth/google/callback
GET    /api/v1/auth/me
```

#### 2. User Management Module (`apps/api/src/modules/user/`)
- ✅ Get current user profile
- ✅ Get user by UUID
- ✅ Delete user (soft delete)
- ✅ Password verification

**Endpoints**:
```
GET    /api/v1/users/me
GET    /api/v1/users/:uuid
DELETE /api/v1/users/me
```

#### 3. Profile Module (`apps/api/src/modules/profile/`)
- ✅ Get extended user profile (company, address)
- ✅ Update profile information
- ✅ Track welcome flow completion
- ✅ Track additional info completion

**Endpoints**:
```
GET    /api/v1/profile
PUT    /api/v1/profile
POST   /api/v1/profile/welcome/complete
POST   /api/v1/profile/additional-info/complete
```

#### 4. Quota Module (`apps/api/src/modules/quota/`)
- ✅ Get user quota information
- ✅ Track quota usage
- ✅ View quota events history
- ✅ Check available quota per definition

**Endpoints**:
```
GET    /api/v1/quota
GET    /api/v1/quota/events?limit=50
```

#### 5. Activity Module (`apps/api/src/modules/activity/`)
- ✅ Aggregated activity feed from:
  - Audit logs
  - Agent conversations
  - Collection entries
- ✅ Recent conversations list
- ✅ Collection activities

**Endpoints**:
```
GET    /api/v1/activity/feed?limit=50&offset=0
GET    /api/v1/activity/conversations?limit=10
GET    /api/v1/activity/collections?limit=20
```

#### 6. Health Module (`apps/api/src/modules/health/`)
- ✅ Database connectivity check
- ✅ Memory usage monitoring
- ✅ Disk space monitoring
- ✅ Kubernetes-ready probes

**Endpoints**:
```
GET    /api/v1/health              # Full health check
GET    /api/v1/health/readiness    # Readiness probe
GET    /api/v1/health/liveness     # Liveness probe
```

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
# Shared database with EasyMate
DATABASE_URL="postgresql://admin:admin@localhost:5432/composer_db?schema=public&connect_timeout=300"
```

### Available Tables

The API has access to **all EasyMate/Buela tables**, including:

- ✅ `User` - User accounts
- ✅ `Company` - Company information
- ✅ `Agent` - AI agents
- ✅ `AgentUserConversation` - Conversations
- ✅ `CollectionDefinition` - Collection schemas
- ✅ `CollectionEntry` - Collection data
- ✅ `UserAgentQuota` - Quota tracking
- ✅ `QuotaUsage` - Usage records
- ✅ `QuotaEvent` - Quota events
- ✅ `AuditLog` - Activity logs
- ✅ And 90+ more models...

### Prisma Schema

The Prisma schema in `/apps/api/prisma/schema.prisma` defines the subset of models needed for COTH Mobile. The full schema is maintained in `buela-all`.

---

## 🐳 Docker Deployment

### Development

```bash
# Use existing infrastructure from buela-all
cd ../buela-all
docker-compose -f docker-compose-infrastructure.yml up -d

# Build and run COTH API
cd ../coth-mobile/apps/api
docker build -t coth-api:latest .
docker run -p 3006:3006 --env-file .env coth-api:latest
```

### Production

TBD - Will use Kubernetes or Cloud Run

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

### ✅ Completed (POC)

- ✅ Monorepo structure with Turborepo
- ✅ Backend API with NestJS
- ✅ 6 API modules implemented (22 endpoints)
- ✅ Database connection to shared EasyMate database
- ✅ JWT + Google OAuth authentication
- ✅ Comprehensive API documentation
- ✅ Docker support
- ✅ Health monitoring
- ✅ Swagger documentation

### 🔄 In Progress

- Mobile app development (Frontend team)

### 📋 TODO

- [ ] Add comprehensive tests
- [ ] Configure CI/CD pipeline
- [ ] Setup production deployment
- [ ] Add push notifications
- [ ] Implement WebSocket for real-time updates
- [ ] Add analytics tracking
- [ ] Performance monitoring
- [ ] Security audit

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
| **API Modules** | 6 |
| **API Endpoints** | 22 |
| **Database Tables** | 97+ (shared) |
| **TypeScript Files** | 31+ |
| **Lines of Code** | ~2,500+ |

---

**Version**: 0.1.0 (POC)
**Status**: Backend Complete, Frontend Placeholder
**Last Updated**: 2025-10-17
