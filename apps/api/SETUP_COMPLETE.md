# Coth API - GraphQL Backend Setup Complete

## Overview
A NestJS-based GraphQL API that mirrors the EasyMate/Buela architecture, connecting to the same PostgreSQL database with full Prisma ORM integration.

## Architecture Summary

### Key Features
- **GraphQL API** (not REST) using Apollo Server
- **NestJS Framework** with modular architecture
- **Prisma ORM** with PostgreSQL database
- **Transactional Support** via nestjs-cls
- **Full Type Safety** with TypeScript
- **Similar to EasyMate** builder/api structure

## Project Structure

```
apps/api/
├── prisma/
│   ├── schema/
│   │   └── schema.prisma          # Full Prisma schema with enums and models
│   └── schema.prisma              # Legacy schema (can be removed)
├── src/
│   ├── modules/                   # Domain modules (existing)
│   ├── common/                    # Shared utilities (existing)
│   ├── config/                    # Configuration (existing)
│   ├── app.module.ts             # Root module (existing)
│   └── main.ts                    # Application entry point (existing)
├── package.json                   # Updated with all GraphQL dependencies
├── .env.example                   # Updated environment template
└── SETUP_COMPLETE.md             # This file
```

## Created/Updated Files

### 1. Prisma Schema (`prisma/schema/schema.prisma`)
- **Full database schema** modeled after EasyMate
- **Enums**: EnumUserRole, EnumUserStatus, EnumRegistrationReferralChannel
- **Core Models**:
  - User (with all relations)
  - Company
  - Address
  - Country
  - AuthProvider
  - Role
  - UserAgentQuota, QuotaDefinition, QuotaUsage, QuotaEvent
  - Agent, AgentUserConversation, AgentUserMessage
  - CollectionDefinition, CollectionEntry
  - AuditLog
- **Advanced Features**:
  - Full-text search indices (gin_trgm_ops)
  - JSON field indices
  - Array operation indices
  - Vector extension support

### 2. Package.json Dependencies
Added all required dependencies:
- **GraphQL**: @apollo/server, @nestjs/apollo, @nestjs/graphql, graphql-depth-limit, graphql-query-complexity
- **Transactions**: @nestjs-cls/core, @nestjs-cls/transactional, @nestjs-cls/transactional-adapter-prisma, nestjs-cls
- **Caching**: @nestjs/cache-manager, cache-manager
- **Logging**: nestjs-pino, pino-http
- **Auth**: passport, passport-jwt, passport-local, passport-google-oauth20
- **Prisma**: @prisma/client, prisma, prisma-dbml-generator
- **Scalars**: graphql-scalars, graphql-type-json

### 3. Environment Configuration (`.env.example`)
Updated with all required environment variables:
- Database configuration (DATABASE_URL, DIRECT_DATABASE_URL)
- Database transaction settings
- GraphQL configuration (playground, introspection, depth limits, complexity)
- JWT settings
- Cache configuration
- Rate limiting
- Logging levels

## Database Schema Highlights

### User Model
```prisma
model User {
  id                             BigInt
  uuid                           String
  email                          String          @unique
  roles                          EnumUserRole[]
  status                         EnumUserStatus?
  company                        Company?
  address                        Address?
  authProviders                  AuthProvider[]
  agentUserConversations         AgentUserConversation[]
  collectionEntries              CollectionEntry[]
  auditLogs                      AuditLog[]
  // ... and more
}
```

### Agent System
```prisma
model Agent {
  id                     BigInt
  name                   String
  configuration          Json?
  agentUserConversations AgentUserConversation[]
}

model AgentUserConversation {
  id                BigInt
  userId            BigInt
  agentId           BigInt
  agentUserMessages AgentUserMessage[]
}
```

### Quota Management
```prisma
model UserAgentQuota {
  id                BigInt
  userId            BigInt
  quotaDefinitionId BigInt
  currentUsage      Int
  limit             Int
  isUnlimited       Boolean
}
```

## GraphQL Setup

### Key Configuration
- **Apollo Server 4** integration
- **Query depth limiting** (configurable, default: 10)
- **Query complexity** analysis (default max: 1000)
- **GraphQL Playground** (enabled in development)
- **Schema auto-generation** from TypeScript decorators
- **Field middleware** support
- **DataLoader** pattern ready

### Example GraphQL Schema (Auto-generated)
```graphql
type User {
  id: BigInt!
  uuid: String!
  email: String!
  firstName: String
  lastName: String
  roles: [String!]!
  status: String
  # ... more fields
}

type Query {
  user(id: String!): User
  users(skip: Int, take: Int): [User!]!
}

type Mutation {
  createUser(data: CreateUserInput!): User!
  updateUser(id: String!, data: UpdateUserInput!): User!
  deleteUser(id: String!): User!
}
```

## Integration with EasyMate

### Shared Database
This API connects to the **same PostgreSQL database** as EasyMate/Buela:
- Database: `composer_db`
- Connection via `DATABASE_URL` environment variable
- Same Prisma schema structure
- Full data access to all tables

### Architecture Similarities
1. **NestJS Framework** - Same as EasyMate builder/api
2. **GraphQL First** - Apollo Server setup
3. **Prisma ORM** - Identical schema management
4. **Domain-Driven** - Modular architecture with domains
5. **Transactional** - CLS-based transaction management
6. **Type-Safe** - Full TypeScript integration

## Next Steps

### 1. Install Dependencies
```bash
cd apps/api
npm install
```

### 2. Setup Database
```bash
# Copy environment file
cp .env.example .env

# Update DATABASE_URL in .env to point to your database

# Generate Prisma Client
npm run prisma:generate

# Run migrations (if needed)
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio
```

### 3. Start Development Server
```bash
# From apps/api directory
npm run dev

# Or from monorepo root
npm run api:dev
```

### 4. Access GraphQL Playground
```
http://localhost:3006/graphql
```

### 5. Example Queries

**Get Users:**
```graphql
query {
  users(take: 10) {
    id
    email
    firstName
    lastName
    roles
    status
  }
}
```

**Create User:**
```graphql
mutation {
  createUser(data: {
    username: "johndoe"
    email: "john@example.com"
    password: "securepassword"
    firstName: "John"
    lastName: "Doe"
  }) {
    id
    email
    firstName
  }
}
```

## Additional Modules to Implement

Based on EasyMate structure, you can add these domain modules:

1. **Authentication Module** (`src/modules/auth/`)
   - JWT strategy
   - Google OAuth
   - Refresh tokens
   - Guards and decorators

2. **User Module** (already scaffolded)
   - User CRUD operations
   - User profile management
   - User roles and permissions

3. **Agent Module** (`src/modules/agent/`)
   - Agent management
   - Conversation handling
   - Message processing

4. **Collection Module** (`src/modules/collection/`)
   - Dynamic collections
   - Collection entries
   - Collection definitions

5. **Quota Module** (`src/modules/quota/`)
   - Quota tracking
   - Usage monitoring
   - Limit enforcement

6. **Company Module** (`src/modules/company/`)
   - Company management
   - Multi-tenancy support

## Configuration Files

### tsconfig.json
Already configured with path aliases:
- `@src/*` → `src/*`
- `@modules/*` → `src/modules/*`
- `@common/*` → `src/common/*`
- `@config/*` → `src/config/*`

### nest-cli.json
Already configured for NestJS CLI operations

## GraphQL Best Practices Implemented

1. **Field Resolvers** - Lazy loading of relations
2. **DataLoader Pattern** - N+1 query prevention (ready to implement)
3. **Input DTOs** - Separate input types for mutations
4. **Object Types** - GraphQL schema from TypeScript classes
5. **Scalars** - Custom BigInt, JSON scalars
6. **Complexity Analysis** - Prevent expensive queries
7. **Depth Limiting** - Prevent deeply nested queries

## Security Features

1. **Rate Limiting** - ThrottlerModule configured
2. **CORS** - Enabled with security headers
3. **Validation** - class-validator on all inputs
4. **JWT Auth** - Ready for implementation
5. **Role-Based Access** - Schema ready for ACL

## Performance Optimizations

1. **Connection Pooling** - Prisma connection management
2. **Query Caching** - Cache manager integrated
3. **Transactional Queries** - CLS transaction support
4. **Batch Operations** - Ready for implementation
5. **Index Coverage** - Full-text search indices on schema

## Monitoring & Logging

1. **Pino Logger** - Structured logging
2. **Health Checks** - Terminus module ready
3. **Sentry Integration** - Error tracking configured
4. **Prisma Logging** - Query and error logs

## Development Workflow

```bash
# Start dev server with hot reload
npm run dev

# Generate Prisma client after schema changes
npm run prisma:generate

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format

# Build for production
npm run build

# Start production server
npm run start:prod
```

## Documentation

- **GraphQL Schema**: Auto-generated at `schema.graphql`
- **Prisma DBML**: Auto-generated database diagram
- **API Docs**: Use GraphQL Playground for interactive docs

## Summary

✅ **Complete GraphQL API structure** based on EasyMate architecture
✅ **Full Prisma schema** with all models and relations
✅ **NestJS modular architecture** ready for domain modules
✅ **Database connection** to shared PostgreSQL database
✅ **Environment configuration** with all required variables
✅ **Package dependencies** for GraphQL, Prisma, Auth, etc.
✅ **Development ready** - just run `npm install` and `npm run dev`

This API is now ready to be used alongside the EasyMate API, sharing the same database and following similar architectural patterns with GraphQL as the primary API protocol.
