# COTH Mobile API - GraphQL Architecture

> **GraphQL API following EasyMate/Buela Builder API pattern**

## 🎯 Overview

The COTH Mobile API uses **GraphQL** with Apollo Server (same as EasyMate/Buela Builder API) instead of REST, providing a type-safe, efficient API for mobile applications.

### Technology Stack

- **GraphQL Server**: Apollo Server 4.x
- **Framework**: NestJS with @nestjs/graphql
- **Schema Generation**: Code-first with TypeScript decorators
- **Authentication**: JWT with GraphQL context
- **Database**: Prisma ORM (shared with EasyMate)

---

## 📊 GraphQL Schema

### Queries

```graphql
type Query {
  # Authentication
  me: User!                                    # Get current user

  # User Management
  user(uuid: String!): User                    # Get user by UUID

  # Profile
  profile: UserProfile!                        # Get extended profile

  # Quota
  userQuota: QuotaInfo!                        # Get quota information
  quotaEvents(limit: Int): [QuotaEvent!]!      # Get quota events

  # Activity
  activityFeed(limit: Int, offset: Int): ActivityFeedResponse!
  recentConversations(limit: Int): [Conversation!]!
  collectionActivities(limit: Int): [CollectionActivity!]!

  # Health
  health: HealthStatus!
}

type Mutation {
  # Authentication
  register(input: RegisterInput!): AuthResponse!
  login(input: LoginInput!): AuthResponse!
  refreshToken(refreshToken: String!): TokenResponse!
  logout: Boolean!

  # User Management
  deleteMe: Boolean!

  # Profile
  updateProfile(input: UpdateProfileInput!): User!
  completeWelcome: User!
  completeAdditionalInfo: User!
}
```

### Types

```graphql
# User & Authentication
type User {
  uuid: ID!
  email: String!
  username: String!
  firstName: String
  lastName: String
  roles: [String!]!
  status: String
  phone: String
  completedWelcome: Boolean!
  completedAdditionalInformation: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
  lastLoginTime: DateTime
  metadata: JSON
}

type AuthResponse {
  user: User!
  accessToken: String!
  refreshToken: String!
}

type TokenResponse {
  accessToken: String!
  refreshToken: String!
}

# Profile
type UserProfile {
  uuid: ID!
  email: String!
  username: String!
  firstName: String
  lastName: String
  phone: String
  status: String
  roles: [String!]!
  completedWelcome: Boolean!
  completedAdditionalInformation: Boolean!
  company: Company
  address: Address
  metadata: JSON
}

type Company {
  uuid: ID!
  name: String!
  logo: String
}

type Address {
  street1: String
  street2: String
  city: String
  state: String
  zip: String
  country: Country
}

type Country {
  code: String!
  name: String!
}

# Quota
type QuotaInfo {
  quotas: [UserQuota!]!
  totalUsage: Int!
  recentUsage: [QuotaUsage!]!
}

type UserQuota {
  uuid: ID!
  quotaDefinition: QuotaDefinition!
  currentUsage: Int!
  limit: Int!
  resetDate: DateTime
  isUnlimited: Boolean!
  remainingQuota: Int
  usagePercentage: Float!
}

type QuotaDefinition {
  uuid: ID!
  name: String!
  description: String
}

type QuotaEvent {
  uuid: ID!
  createdAt: DateTime!
  eventType: String!
  amount: Int!
  quotaDefinition: QuotaDefinition!
}

type QuotaUsage {
  uuid: ID!
  createdAt: DateTime!
  usage: Int!
}

# Activity
type ActivityFeedResponse {
  items: [ActivityItem!]!
  total: Int!
}

type ActivityItem {
  id: ID!
  type: String!
  action: String!
  description: String!
  timestamp: DateTime!
  metadata: JSON
  relatedEntity: RelatedEntity
}

type RelatedEntity {
  type: String!
  id: String!
  name: String
}

type Conversation {
  uuid: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  agent: Agent!
  messageCount: Int!
}

type Agent {
  uuid: ID!
  name: String!
  description: String
}

type CollectionActivity {
  uuid: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  collectionDefinition: CollectionDefinition!
}

type CollectionDefinition {
  uuid: ID!
  name: String!
  slug: String
}

# Health
type HealthStatus {
  status: String!
  database: String!
  timestamp: DateTime!
}

# Inputs
input RegisterInput {
  email: String!
  username: String!
  password: String!
  firstName: String
  lastName: String
  phone: String
}

input LoginInput {
  email: String!
  password: String!
}

input UpdateProfileInput {
  firstName: String
  lastName: String
  phone: String
  metadata: JSON
}

# Scalars
scalar DateTime
scalar JSON
```

---

## 🏗️ Module Structure

### Authentication Module

```
auth/
├── entities/
│   ├── auth-response.entity.ts      # AuthResponse type
│   └── token-response.entity.ts     # TokenResponse type
├── dto/
│   ├── register.input.ts            # RegisterInput
│   ├── login.input.ts               # LoginInput
│   └── refresh-token.input.ts       # RefreshTokenInput
├── guards/
│   ├── gql-auth.guard.ts            # GraphQL JWT guard
│   └── gql-google-auth.guard.ts     # GraphQL OAuth guard
├── decorators/
│   └── current-user.decorator.ts    # @CurrentUser() decorator
├── strategies/
│   ├── jwt.strategy.ts              # JWT strategy
│   └── google.strategy.ts           # OAuth strategy
├── auth.resolver.ts                 # GraphQL resolver
├── auth.service.ts                  # Business logic
└── auth.module.ts                   # Module definition
```

### User Module

```
user/
├── entities/
│   └── user.entity.ts              # User GraphQL type
├── user.resolver.ts                 # Queries & mutations
├── user.service.ts                  # Business logic
└── user.module.ts                   # Module definition
```

### Profile Module

```
profile/
├── entities/
│   ├── user-profile.entity.ts      # UserProfile type
│   ├── company.entity.ts           # Company type
│   └── address.entity.ts           # Address type
├── dto/
│   └── update-profile.input.ts     # UpdateProfileInput
├── profile.resolver.ts              # Queries & mutations
├── profile.service.ts               # Business logic
└── profile.module.ts                # Module definition
```

### Quota Module

```
quota/
├── entities/
│   ├── quota-info.entity.ts        # QuotaInfo type
│   ├── user-quota.entity.ts        # UserQuota type
│   └── quota-event.entity.ts       # QuotaEvent type
├── quota.resolver.ts                # Queries
├── quota.service.ts                 # Business logic
└── quota.module.ts                  # Module definition
```

### Activity Module

```
activity/
├── entities/
│   ├── activity-item.entity.ts     # ActivityItem type
│   ├── conversation.entity.ts      # Conversation type
│   └── collection-activity.entity.ts
├── activity.resolver.ts             # Queries
├── activity.service.ts              # Business logic
└── activity.module.ts               # Module definition
```

---

## 🔐 Authentication Flow

### 1. Login/Register

```graphql
# Register
mutation Register {
  register(input: {
    email: "user@example.com"
    username: "johndoe"
    password: "secure123"
    firstName: "John"
    lastName: "Doe"
  }) {
    user {
      uuid
      email
      username
    }
    accessToken
    refreshToken
  }
}

# Login
mutation Login {
  login(input: {
    email: "user@example.com"
    password: "secure123"
  }) {
    user {
      uuid
      email
    }
    accessToken
    refreshToken
  }
}
```

### 2. Authenticated Requests

```graphql
# Include JWT token in HTTP header
# Authorization: Bearer <accessToken>

query Me {
  me {
    uuid
    email
    firstName
    lastName
    roles
  }
}
```

### 3. Token Refresh

```graphql
mutation RefreshToken {
  refreshToken(refreshToken: "your_refresh_token") {
    accessToken
    refreshToken
  }
}
```

---

## 📡 Example Queries & Mutations

### User Management

```graphql
# Get current user
query GetMe {
  me {
    uuid
    email
    username
    firstName
    lastName
    roles
    completedWelcome
  }
}

# Get user by UUID
query GetUser($uuid: String!) {
  user(uuid: $uuid) {
    uuid
    email
    username
  }
}

# Delete account
mutation DeleteAccount {
  deleteMe
}
```

### Profile Management

```graphql
# Get full profile
query GetProfile {
  profile {
    uuid
    email
    firstName
    lastName
    company {
      name
      logo
    }
    address {
      city
      country {
        name
      }
    }
  }
}

# Update profile
mutation UpdateProfile {
  updateProfile(input: {
    firstName: "John"
    lastName: "Doe"
    phone: "+1234567890"
  }) {
    uuid
    firstName
    lastName
  }
}

# Complete welcome
mutation CompleteWelcome {
  completeWelcome {
    completedWelcome
  }
}
```

### Quota Management

```graphql
# Get quota information
query GetQuota {
  userQuota {
    quotas {
      uuid
      quotaDefinition {
        name
      }
      currentUsage
      limit
      remainingQuota
      usagePercentage
    }
    totalUsage
  }
}

# Get quota events
query GetQuotaEvents {
  quotaEvents(limit: 50) {
    uuid
    eventType
    amount
    createdAt
    quotaDefinition {
      name
    }
  }
}
```

### Activity Feed

```graphql
# Get activity feed
query GetActivityFeed {
  activityFeed(limit: 20, offset: 0) {
    items {
      id
      type
      action
      description
      timestamp
      relatedEntity {
        type
        name
      }
    }
    total
  }
}

# Get recent conversations
query GetConversations {
  recentConversations(limit: 10) {
    uuid
    createdAt
    agent {
      name
      description
    }
    messageCount
  }
}
```

---

## 🛡️ Security & Guards

### GraphQL Auth Guard

```typescript
// gql-auth.guard.ts
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
```

### Current User Decorator

```typescript
// current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  },
);
```

### Usage in Resolvers

```typescript
@Resolver(() => User)
export class UserResolver {
  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: any) {
    return this.userService.findByUuid(user.uuid);
  }
}
```

---

## ⚙️ Configuration

### GraphQL Module Setup

```typescript
GraphQLModule.forRootAsync<ApolloDriverConfig>({
  driver: ApolloDriver,
  useFactory: (configService: ConfigService) => ({
    buildSchemaOptions: {
      numberScalarMode: 'integer',
    },
    cache: 'bounded',
    autoSchemaFile: 'schema.graphql',    // Auto-generate schema
    sortSchema: true,
    playground: true,                     // GraphQL Playground
    introspection: true,
    validationRules: [depthLimit(10)],   // Query depth limit
    context: ({ req, res }) => ({ req, res }),
  }),
})
```

### Environment Variables

```bash
# GraphQL Configuration
GRAPHQL_PLAYGROUND=true
GRAPHQL_INTROSPECTION=true
GRAPHQL_QUERY_DEPTH_LIMIT=10

# API Port
API_PORT=3006

# Database (shared with EasyMate)
DATABASE_URL="postgresql://admin:admin@localhost:5432/composer_db"
```

---

## 🚀 Development

### Start API

```bash
cd apps/api
npm run dev
```

### Access GraphQL Playground

```
http://localhost:3006/graphql
```

### Generate Schema

The schema is auto-generated at `schema.graphql` from TypeScript decorators.

---

## 📊 Comparison: REST vs GraphQL

| Feature | REST (Old) | GraphQL (Current) |
|---------|------------|-------------------|
| **Endpoints** | 22 REST endpoints | Single `/graphql` endpoint |
| **Documentation** | Swagger UI | GraphQL Playground |
| **Type Safety** | OpenAPI spec | GraphQL schema |
| **Over-fetching** | Yes | No (request only needed fields) |
| **Under-fetching** | Yes (multiple requests) | No (single request) |
| **Pattern** | Different from EasyMate | ✅ Same as EasyMate/Buela |
| **Learning Curve** | New pattern | Familiar pattern |

---

## 🎯 Benefits of GraphQL

1. **Consistency**: Same pattern as EasyMate/Buela Builder API
2. **Type Safety**: Schema-first with TypeScript
3. **Efficient**: Request only needed data
4. **Single Endpoint**: All queries/mutations at `/graphql`
5. **Introspection**: Self-documenting API
6. **Real-time**: WebSocket subscriptions (future)
7. **Developer Experience**: GraphQL Playground for testing

---

## 📚 Resources

- **GraphQL Playground**: http://localhost:3006/graphql
- **Schema File**: `apps/api/schema.graphql` (auto-generated)
- **Apollo Server Docs**: https://www.apollographql.com/docs/apollo-server/
- **NestJS GraphQL**: https://docs.nestjs.com/graphql/quick-start

---

**Version**: 2.0.0 (GraphQL)
**Pattern**: Code-first with TypeScript decorators
**Compatible with**: EasyMate/Buela Builder API architecture
