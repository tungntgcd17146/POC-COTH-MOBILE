# COTH Mobile - Architecture Documentation

## 🏛️ System Architecture

### High-Level Overview

```
┌────────────────────────────────────────────────────────────────┐
│                                                                 │
│                  COTH Mobile Ecosystem                          │
│              (Separate Monorepo from EasyMate)                  │
│                                                                 │
└────────────────────────────────────────────────────────────────┘

         ┌─────────────────┐              ┌─────────────────┐
         │   React Native  │              │   NestJS API    │
         │   Mobile App    │◄────REST────►│   (Port 3006)   │
         │                 │              │                 │
         │  - iOS App      │              │  - Auth Module  │
         │  - Android App  │              │  - User Module  │
         │  - Expo         │              │  - Health       │
         │                 │              │                 │
         │  (TBD by FE)    │              │  (Other modules │
         └─────────────────┘              │   TBD later)    │
                                          └────────┬────────┘
                                                   │
                                                   │ Prisma ORM
                                                   │
                                          ┌────────▼────────┐
                                          │   PostgreSQL    │
                                          │   Database      │
                                          │  (coth_mobile)  │
                                          │  Port: 5432     │
                                          └─────────────────┘
                                                   │
                                                   │ Data Migration
                                                   │ (planned later)
                                                   │
                                          ┌────────▼────────┐
                                          │   EasyMate/     │
                                          │   Buela API     │
                                          │  (buela-all)    │
                                          │  Port: 3002     │
                                          │  (composer_db)  │
                                          └─────────────────┘

      Separate Databases - Will migrate/link data later
```

---

## 📂 Monorepo Structure

### Directory Layout

```
coth-mobile/                         # Root directory (separate from buela-all)
│
├── apps/                            # Applications
│   │
│   ├── api/                         # Backend API (Port: 3006)
│   │   ├── src/
│   │   │   ├── modules/             # Domain modules
│   │   │   │   ├── auth/           # Authentication
│   │   │   │   ├── user/           # User management
│   │   │   │   └── health/         # Health monitoring
│   │   │   │   # (Other modules TBD later)
│   │   │   ├── common/             # Shared code
│   │   │   │   ├── prisma/         # Database service
│   │   │   │   ├── filters/        # Exception filters
│   │   │   │   └── guards/         # Auth guards
│   │   │   ├── app.module.ts       # Root module
│   │   │   └── main.ts             # Entry point
│   │   ├── prisma/
│   │   │   └── schema.prisma       # DB schema (separate DB)
│   │   ├── test/                   # Tests
│   │   └── package.json
│   │
│   └── mobile/                      # Mobile App (React Native)
│       ├── src/                     # Frontend code (TBD)
│       └── package.json
│
├── packages/                        # Shared packages
│   └── (future shared code)
│
├── tooling/                         # Build tools
│   └── (configs, scripts)
│
├── package.json                     # Root package.json
├── turbo.json                       # Turborepo config
└── .env.example                     # Environment template
```

---

## 🗄️ Database Architecture

### Separate Database Strategy

#### Why Separate Database?

**Decision**: Use a **separate PostgreSQL database** for COTH Mobile

**Rationale**:
1. ✅ **Independent Evolution**: COTH can evolve without affecting EasyMate
2. ✅ **Clear Boundaries**: Better separation of concerns
3. ✅ **Simpler Schema**: Only models needed for mobile features
4. ✅ **Easier Testing**: Can reset/test without affecting EasyMate
5. ✅ **Migration Flexibility**: Can migrate/link data when ready
6. ✅ **Performance Isolation**: COTH load won't impact EasyMate

### Database Connection

```typescript
// Separate databases for each project

// EasyMate/Buela (buela-all)
DATABASE_URL="postgresql://admin:admin@localhost:5432/composer_db"

// COTH Mobile (coth-mobile) - Different database
DATABASE_URL="postgresql://admin:admin@localhost:5432/coth_mobile"
```

### Schema Management

```
┌──────────────────────────────────────────────────────────┐
│              COTH Mobile PostgreSQL Database              │
│                     (coth_mobile)                         │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Core Tables (MVP - User & Auth Only)              │ │
│  │                                                    │ │
│  │  User Management:                                  │ │
│  │    - User         (core user model)                │ │
│  │    - AuthProvider (OAuth providers)                │ │
│  │    - Role         (user roles/permissions)         │ │
│  │                                                    │ │
│  │  Enums:                                            │ │
│  │    - EnumUserRole                                  │ │
│  │    - EnumUserStatus                                │ │
│  │    - EnumRegistrationReferralChannel               │ │
│  │                                                    │ │
│  │  Other models will be added later as needed       │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  Schema is maintained in:                               │
│    coth-mobile/apps/api/prisma/schema.prisma            │
│                                                          │
│  Data Migration Strategy (Future):                      │
│    - Option 1: Periodic sync from EasyMate             │
│    - Option 2: API-based data access                   │
│    - Option 3: ETL pipeline                            │
│    - Decision: TBD based on requirements               │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│            EasyMate PostgreSQL Database                   │
│                     (composer_db)                         │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Full Schema (97+ models)                          │ │
│  │    - All EasyMate/Buela features                   │ │
│  │    - Agent, Collections, Workflows, etc.           │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## 🔄 API Architecture

### Module-Based Design

```
┌─────────────────────────────────────────────────────────┐
│                   COTH Mobile API                        │
│                  (NestJS Framework)                      │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  HTTP Layer (Express)                              │ │
│  │  - CORS                                            │ │
│  │  - Body Parser (50MB limit)                       │ │
│  │  - Rate Limiting (100 req/min)                    │ │
│  └───────────────────────────────────────────────────┘ │
│                          │                             │
│  ┌───────────────────────▼───────────────────────────┐ │
│  │  Global Middleware                                 │ │
│  │  - Exception Filter                                │ │
│  │  - Validation Pipe                                 │ │
│  │  - Transform Pipe                                  │ │
│  └───────────────────────┬───────────────────────────┘ │
│                          │                             │
│  ┌───────────────────────▼───────────────────────────┐ │
│  │  Feature Modules                                   │ │
│  │                                                    │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐       │ │
│  │  │   Auth   │  │   User   │  │  Health  │       │ │
│  │  │  Module  │  │  Module  │  │  Module  │       │ │
│  │  └──────────┘  └──────────┘  └──────────┘       │ │
│  │                                                    │ │
│  │  (Other modules will be added later as needed)    │ │
│  │                                                    │ │
│  └───────────────────────┬───────────────────────────┘ │
│                          │                             │
│  ┌───────────────────────▼───────────────────────────┐ │
│  │  Common Services                                   │ │
│  │  - Prisma Service (Database)                      │ │
│  │  - Auth Guards (JWT, OAuth)                       │ │
│  │  - Exception Filters                              │ │
│  └───────────────────────┬───────────────────────────┘ │
│                          │                             │
│  ┌───────────────────────▼───────────────────────────┐ │
│  │  Prisma ORM                                        │ │
│  │  - Query Builder                                   │ │
│  │  - Type Safety                                     │ │
│  │  - Connection Pool                                 │ │
│  └───────────────────────┬───────────────────────────┘ │
│                          │                             │
└──────────────────────────┼─────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  PostgreSQL Database   │
              │    (Shared with        │
              │     EasyMate)          │
              └────────────────────────┘
```

### Module Details

#### 1. Authentication Module

**Responsibilities**:
- User registration
- Login/logout
- JWT token management (access + refresh)
- Google OAuth integration
- Password hashing

**Components**:
```
auth/
├── dto/                    # Data transfer objects
│   ├── login.dto.ts
│   ├── login.input.ts
│   ├── register.dto.ts
│   ├── register.input.ts
│   └── refresh-token.dto.ts
├── entities/
│   └── auth-response.entity.ts
├── guards/                 # Route guards
│   ├── jwt-auth.guard.ts
│   ├── gql-auth.guard.ts
│   └── google-auth.guard.ts
├── strategies/             # Passport strategies
│   ├── jwt.strategy.ts
│   ├── jwt-refresh.strategy.ts
│   └── google.strategy.ts
├── decorators/
│   └── current-user.decorator.ts
├── auth.controller.ts      # REST endpoints
├── auth.resolver.ts        # GraphQL resolvers
├── auth.service.ts         # Business logic
└── auth.module.ts          # Module definition
```

#### 2. User Management Module

**Responsibilities**:
- User CRUD operations
- User lookup (by UUID, email)
- User deletion (soft delete)
- User profile management

**Components**:
```
user/
├── entities/
│   └── user.entity.ts
├── user.controller.ts      # REST endpoints
├── user.resolver.ts        # GraphQL resolvers
├── user.service.ts         # Business logic
└── user.module.ts          # Module definition
```

#### 3. Health Module

**Responsibilities**:
- Database health checks
- Memory monitoring
- Disk monitoring
- Kubernetes probes (liveness/readiness)

**Components**:
```
health/
├── entities/
│   └── health-status.entity.ts
├── health.controller.ts    # REST endpoints
├── health.resolver.ts      # GraphQL resolvers
├── health.service.ts       # Health check logic
└── health.module.ts        # Module definition
```

#### Future Modules (TBD)

These modules will be implemented later based on requirements:
- Profile Module (extended user information)
- Quota Module (usage tracking)
- Activity Module (activity feed)
- Other domain-specific modules

---

## 🔐 Security Architecture

### Authentication Flow

```
┌──────────┐                           ┌──────────┐
│  Mobile  │                           │   API    │
│   App    │                           │          │
└────┬─────┘                           └────┬─────┘
     │                                      │
     │  1. POST /auth/register             │
     │     or /auth/login                  │
     ├──────────────────────────────────►  │
     │                                      │
     │                                 2. Validate
     │                                    credentials
     │                                      │
     │  3. Access Token (24h)              │
     │     Refresh Token (30d)             │
     │  ◄──────────────────────────────────┤
     │                                      │
     │  4. API Request                     │
     │     Authorization: Bearer {token}   │
     ├──────────────────────────────────►  │
     │                                      │
     │                                 5. Verify JWT
     │                                      │
     │  6. Response                        │
     │  ◄──────────────────────────────────┤
     │                                      │
     │  7. Token Expired (after 24h)       │
     │  ◄──────────────────────────────────┤
     │                                      │
     │  8. POST /auth/refresh              │
     │     { refreshToken }                │
     ├──────────────────────────────────►  │
     │                                      │
     │  9. New Access Token                │
     │  ◄──────────────────────────────────┤
     │                                      │
```

### OAuth Flow (Google)

```
┌──────────┐          ┌──────────┐          ┌──────────┐
│  Mobile  │          │   API    │          │  Google  │
│   App    │          │          │          │   OAuth  │
└────┬─────┘          └────┬─────┘          └────┬─────┘
     │                     │                     │
     │  1. Open OAuth URL  │                     │
     ├────────────────────►│                     │
     │                     │                     │
     │  2. Redirect to     │                     │
     │     Google          ├────────────────────►│
     │  ◄──────────────────┤                     │
     │                     │                     │
     │  3. User authenticates with Google        │
     │     ◄────────────────────────────────────►│
     │                     │                     │
     │                     │  4. OAuth callback  │
     │                     │     with code       │
     │                     │  ◄──────────────────┤
     │                     │                     │
     │                     │  5. Exchange code   │
     │                     │     for token       │
     │                     ├────────────────────►│
     │                     │                     │
     │                     │  6. User profile    │
     │                     │  ◄──────────────────┤
     │                     │                     │
     │                  7. Create/login user     │
     │                     │                     │
     │  8. Access Token    │                     │
     │     Refresh Token   │                     │
     │  ◄──────────────────┤                     │
     │                     │                     │
```

### Security Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Request Flow                          │
│                                                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │  1. Rate Limiting (100 req/min)                    │ │
│  │     ↓                                               │ │
│  │  2. CORS Check                                      │ │
│  │     ↓                                               │ │
│  │  3. Body Parser (50MB limit)                       │ │
│  │     ↓                                               │ │
│  │  4. JWT Validation (if protected route)            │ │
│  │     ↓                                               │ │
│  │  5. Input Validation (class-validator)             │ │
│  │     ↓                                               │ │
│  │  6. Business Logic                                  │ │
│  │     ↓                                               │ │
│  │  7. Database Query (Prisma)                        │ │
│  │     ↓                                               │ │
│  │  8. Response Transform                             │ │
│  │     ↓                                               │ │
│  │  9. Error Handling (if any)                        │ │
│  │     ↓                                               │ │
│  │  10. Response                                       │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Deployment Architecture

### Development Environment

```
┌────────────────────────────────────────────────────────┐
│                  Developer Machine                      │
│                                                        │
│  ┌──────────────┐      ┌──────────────┐             │
│  │  COTH Mobile │      │  EasyMate/   │             │
│  │   (Port      │      │   Buela      │             │
│  │    3006)     │      │  (Port 3002) │             │
│  └──────┬───────┘      └──────┬───────┘             │
│         │                     │                       │
│         └──────────┬──────────┘                       │
│                    │                                  │
│            ┌───────▼────────┐                         │
│            │   PostgreSQL   │                         │
│            │  (Port 5432)   │                         │
│            │                │                         │
│            │  Docker        │                         │
│            │  Container     │                         │
│            └────────────────┘                         │
│                                                        │
│  docker-compose-infrastructure.yml                    │
└────────────────────────────────────────────────────────┘
```

### Production Environment (Proposed)

```
┌──────────────────────────────────────────────────────────┐
│                      Cloud Provider                       │
│                   (GCP / AWS / Azure)                     │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Load Balancer                                      │ │
│  │  (HTTPS/TLS)                                        │ │
│  └─────────────┬──────────────────────────────────────┘ │
│                │                                         │
│      ┌─────────┴─────────┐                              │
│      │                   │                              │
│  ┌───▼───────┐    ┌─────▼──────┐                       │
│  │  COTH API │    │  EasyMate  │                       │
│  │  Cluster  │    │  Cluster   │                       │
│  │  (K8s/CR) │    │  (K8s/CR)  │                       │
│  └───┬───────┘    └─────┬──────┘                       │
│      │                  │                               │
│      └────────┬─────────┘                               │
│               │                                         │
│        ┌──────▼──────┐                                  │
│        │  Cloud SQL  │                                  │
│        │ PostgreSQL  │                                  │
│        │  (Managed)  │                                  │
│        └─────────────┘                                  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Additional Services                                │ │
│  │  - Cloud Storage (files)                           │ │
│  │  - Redis (caching)                                  │ │
│  │  - Monitoring (Sentry, CloudWatch)                │ │
│  │  - CDN                                              │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow

### User Activity Feed Example

```
Mobile App Request
       │
       │  GET /api/v1/activity/feed
       │  Authorization: Bearer {token}
       │
       ▼
┌──────────────┐
│  API Gateway │  1. Validate JWT
└──────┬───────┘  2. Extract user info
       │
       ▼
┌──────────────┐
│  Activity    │  3. Call service method
│  Controller  │     getActivityFeed()
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Activity    │  4. Query multiple sources
│  Service     │     - Audit logs
└──────┬───────┘     - Conversations
       │             - Collections
       │
       ▼
┌──────────────┐
│  Prisma      │  5. Execute queries
│  Service     │     - auditLog.findMany()
└──────┬───────┘     - conversation.findMany()
       │             - collectionEntry.findMany()
       │
       ▼
┌──────────────┐
│  PostgreSQL  │  6. Fetch data
│  Database    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Activity    │  7. Aggregate results
│  Service     │  8. Sort by timestamp
└──────┬───────┘  9. Paginate
       │
       ▼
┌──────────────┐
│  Activity    │  10. Transform to DTO
│  Controller  │  11. Return response
└──────┬───────┘
       │
       ▼
    Mobile App
  (Activity Feed)
```

---

## 🎯 Scalability Considerations

### Horizontal Scaling

- **API Servers**: Stateless, can scale horizontally
- **Database**: Shared, can use read replicas
- **Caching**: Redis cluster for distributed caching

### Performance Optimization

- Connection pooling (10-50 connections)
- Query optimization with Prisma
- Response caching where appropriate
- Rate limiting to prevent abuse

---

**Version**: 1.0.0
**Last Updated**: 2025-10-17
**Status**: POC Complete
