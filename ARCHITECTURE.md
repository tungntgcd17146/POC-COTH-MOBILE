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
         │  - Expo         │              │  - Profile      │
         │                 │              │  - Quota        │
         │  (TBD by FE)    │              │  - Activity     │
         └─────────────────┘              │  - Health       │
                                          └────────┬────────┘
                                                   │
                                                   │ Prisma ORM
                                                   │
                                          ┌────────▼────────┐
                                          │   PostgreSQL    │
                                          │   Database      │
                                          │ (composer_db)   │
                                          │  Port: 5432     │
                                          └────────▲────────┘
                                                   │
                                                   │ Shared DB
                                                   │
                                          ┌────────┴────────┐
                                          │   EasyMate/     │
                                          │   Buela API     │
                                          │  (buela-all)    │
                                          │  Port: 3002     │
                                          └─────────────────┘

      Same Database - Different Applications - No Data Duplication
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
│   │   │   │   ├── profile/        # Profile management
│   │   │   │   ├── quota/          # Quota tracking
│   │   │   │   ├── activity/       # Activity feed
│   │   │   │   └── health/         # Health monitoring
│   │   │   ├── common/             # Shared code
│   │   │   │   ├── prisma/         # Database service
│   │   │   │   ├── filters/        # Exception filters
│   │   │   │   └── guards/         # Auth guards
│   │   │   ├── app.module.ts       # Root module
│   │   │   └── main.ts             # Entry point
│   │   ├── prisma/
│   │   │   └── schema.prisma       # DB schema (subset)
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

### Shared Database Strategy

#### Why Shared Database?

**Decision**: Use the **same PostgreSQL database** as EasyMate/Buela

**Rationale**:
1. ✅ **No Data Migration**: Instant access to all user data
2. ✅ **Single Source of Truth**: No sync issues
3. ✅ **Zero Duplication**: Same users, same data
4. ✅ **Simpler Development**: No data sync logic
5. ✅ **Cost Effective**: One database to maintain
6. ✅ **Real-time Consistency**: Changes reflect immediately

### Database Connection

```typescript
// Both projects connect to the same database
// Location: localhost:5432/composer_db

// EasyMate/Buela (buela-all)
DATABASE_URL="postgresql://admin:admin@localhost:5432/composer_db"

// COTH Mobile (coth-mobile)
DATABASE_URL="postgresql://admin:admin@localhost:5432/composer_db"  // Same!
```

### Schema Management

```
┌──────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                     │
│                     (composer_db)                         │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Tables (97+ models)                               │ │
│  │                                                    │ │
│  │  Core Tables:                                      │ │
│  │    - User                                          │ │
│  │    - Company                                       │ │
│  │    - Address                                       │ │
│  │    - AuthProvider                                  │ │
│  │                                                    │ │
│  │  Agent Tables:                                     │ │
│  │    - Agent                                         │ │
│  │    - AgentUserConversation                        │ │
│  │    - AgentUserMessage                             │ │
│  │                                                    │ │
│  │  Collection Tables:                                │ │
│  │    - CollectionDefinition                         │ │
│  │    - CollectionEntry                              │ │
│  │    - CollectionEntryData                          │ │
│  │                                                    │ │
│  │  Quota Tables:                                     │ │
│  │    - QuotaDefinition                              │ │
│  │    - UserAgentQuota                               │ │
│  │    - QuotaUsage                                    │ │
│  │    - QuotaEvent                                    │ │
│  │                                                    │ │
│  │  Audit & Activity:                                 │ │
│  │    - AuditLog                                      │ │
│  │                                                    │ │
│  │  And 80+ more tables...                           │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  Schema is maintained in:                               │
│    buela-all/apps/builder/api/prisma/schema/            │
│                                                          │
│  COTH Mobile uses a subset:                             │
│    coth-mobile/apps/api/prisma/schema.prisma            │
│    (includes only models needed for mobile API)         │
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
│  │  │   Auth   │  │   User   │  │ Profile  │       │ │
│  │  │  Module  │  │  Module  │  │  Module  │       │ │
│  │  └──────────┘  └──────────┘  └──────────┘       │ │
│  │                                                    │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐       │ │
│  │  │  Quota   │  │ Activity │  │  Health  │       │ │
│  │  │  Module  │  │  Module  │  │  Module  │       │ │
│  │  └──────────┘  └──────────┘  └──────────┘       │ │
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
│   ├── register.dto.ts
│   └── refresh-token.dto.ts
├── guards/                 # Route guards
│   ├── jwt-auth.guard.ts
│   └── google-auth.guard.ts
├── strategies/             # Passport strategies
│   ├── jwt.strategy.ts
│   ├── jwt-refresh.strategy.ts
│   └── google.strategy.ts
├── auth.controller.ts      # HTTP endpoints
├── auth.service.ts         # Business logic
└── auth.module.ts          # Module definition
```

#### 2. User Management Module

**Responsibilities**:
- User CRUD operations
- User lookup (by UUID, email)
- User deletion (soft delete)

#### 3. Profile Module

**Responsibilities**:
- Extended user profile
- Profile updates
- Welcome/onboarding flow
- Additional information tracking

#### 4. Quota Module

**Responsibilities**:
- Quota information retrieval
- Usage tracking
- Event history
- Quota availability checks

#### 5. Activity Module

**Responsibilities**:
- Aggregated activity feed
- Conversation history
- Collection activity
- Multi-source aggregation

#### 6. Health Module

**Responsibilities**:
- Database health
- Memory monitoring
- Disk monitoring
- Kubernetes probes

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
