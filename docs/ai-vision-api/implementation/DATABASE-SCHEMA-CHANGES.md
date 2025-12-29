# Database Schema Evolution - All Phases

This document details all database schema changes required across the 4 implementation phases.

---

## Current Schema (Baseline)

```prisma
// Core existing models
model Concept { ... }
model ConceptImage { ... }
model GeneratedProduct { ... }
model ArtisanMatch { ... }
model Session { ... }
```

---

## Phase 1: Foundation Enhancements

### 1.1 Progress Tracking

```prisma
model ProgressEvent {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  
  sessionId       String   @db.ObjectId
  session         Session  @relation(fields: [sessionId], references: [id])
  
  stage           ProgressStage
  status          ProgressStatus
  progress        Int      // 0-100
  
  message         String
  data            Json?
  
  timestamp       DateTime @default(now())
  
  @@index([sessionId])
  @@index([timestamp])
}

enum ProgressStage {
  UPLOADING
  ANALYZING
  GENERATING
  MATCHING
  COMPLETED
}

enum ProgressStatus {
  IN_PROGRESS
  COMPLETED
  FAILED
}
```

### 1.2 Concept Refinement

```prisma
model ConceptRefinement {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  
  conceptId       String   @db.ObjectId
  concept         Concept  @relation(fields: [conceptId], references: [id])
  
  refinementType  RefinementType
  userFeedback    String
  
  suggestedChanges Json    // What AI suggested
  appliedChanges   Json?   // What was actually applied
  
  aiExplanation   String
  confidence      Float
  
  createdAt       DateTime @default(now())
  appliedAt       DateTime?
  
  @@index([conceptId])
}

enum RefinementType {
  STYLE
  COLOR
  MATERIAL
  SIZE
  DETAIL
  OCCASION
}

model Concept {
  // ... existing fields ...
  
  refinements     ConceptRefinement[]
  refinementCount Int @default(0)
}
```

### 1.3 Artisan Quotes

```prisma
model QuoteRequest {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  
  conceptId       String   @db.ObjectId
  concept         Concept  @relation(fields: [conceptId], references: [id])
  
  userId          String?  @db.ObjectId
  sessionToken    String
  
  requestedSellers String[] @db.ObjectId // Specific artisans requested
  message         String?   // Custom message to artisans
  
  status          QuoteRequestStatus @default(PENDING)
  expiresAt       DateTime
  
  quotes          ArtisanQuote[]
  
  createdAt       DateTime @default(now())
  
  @@index([conceptId])
  @@index([userId])
}

model ArtisanQuote {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  
  quoteRequestId  String   @db.ObjectId
  quoteRequest    QuoteRequest @relation(fields: [quoteRequestId], references: [id])
  
  sellerId        String   @db.ObjectId
  seller          Seller   @relation(fields: [sellerId], references: [id])
  
  pricing         Json     // { basePrice, customization, materials, shipping }
  totalPrice      Float
  
  estimatedDays   Int
  customizations  Json[]   // Available customization options
  
  notes           String?
  attachments     String[] // Additional images/docs
  
  status          QuoteStatus @default(PENDING)
  viewedByBuyer   Boolean  @default(false)
  viewedAt        DateTime?
  
  createdAt       DateTime @default(now())
  expiresAt       DateTime
  
  @@index([quoteRequestId])
  @@index([sellerId])
}

enum QuoteRequestStatus {
  PENDING
  QUOTES_RECEIVED
  ACCEPTED
  EXPIRED
  CANCELLED
}

enum QuoteStatus {
  PENDING
  ACCEPTED
  REJECTED
  EXPIRED
}
```

### 1.4 Mobile Optimization Metadata

```prisma
model ConceptImage {
  // ... existing fields ...
  
  optimizedVersions Json?   // { thumbnail, mobile, tablet, desktop }
  compressionRatio  Float?
  format            String   // webp, avif, jpeg
  lazyLoadPriority  Int      @default(0)
}
```

---

## Phase 2: Engagement & Discovery

### 2.1 Concept Sharing

```prisma
model SharedConcept {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  shareToken      String   @unique
  
  conceptId       String   @db.ObjectId
  concept         Concept  @relation(fields: [conceptId], references: [id])
  
  sharedBy        String?  @db.ObjectId
  sharedWith      String[] // Email addresses or user IDs
  
  allowComments   Boolean  @default(true)
  allowVoting     Boolean  @default(false)
  isPublic        Boolean  @default(true)
  
  viewCount       Int      @default(0)
  lastViewedAt    DateTime?
  
  metadata        Json     // Title, image, etc.
  expiresAt       DateTime?
  
  comments        ConceptComment[]
  votes           ConceptVote[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([shareToken])
  @@index([conceptId])
}

model ConceptComment {
  id               String   @id @default(auto()) @map("_id") @db.ObjectId
  
  sharedConceptId  String   @db.ObjectId
  sharedConcept    SharedConcept @relation(fields: [sharedConceptId], references: [id])
  
  userId           String   @db.ObjectId
  user             User     @relation(fields: [userId], references: [id])
  
  comment          String
  
  parentCommentId  String?  @db.ObjectId
  parentComment    ConceptComment? @relation("CommentReplies", fields: [parentCommentId], references: [id], onDelete: NoAction, onUpdate: NoAction)
  replies          ConceptComment[] @relation("CommentReplies")
  
  createdAt        DateTime @default(now())
  
  @@index([sharedConceptId])
  @@index([userId])
}

model ConceptVote {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  
  sharedConceptId String   @db.ObjectId
  sharedConcept   SharedConcept @relation(fields: [sharedConceptId], references: [id])
  
  userId          String   @db.ObjectId
  user            User     @relation(fields: [userId], references: [id])
  
  voteType        VoteType
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@unique([sharedConceptId, userId])
}

enum VoteType {
  UPVOTE
  DOWNVOTE
}
```

### 2.2 Comparison System

```prisma
model ComparisonSet {
  id             String   @id @default(auto()) @map("_id") @db.ObjectId
  
  userId         String?  @db.ObjectId
  sessionToken   String
  
  items          Json     // Array of { type, id }
  metadata       Json?
  
  createdAt      DateTime @default(now())
  
  @@index([userId])
  @@index([sessionToken])
}
```

### 2.3 Library & Organization

```prisma
model ConceptFolder {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  
  userId      String   @db.ObjectId
  user        User     @relation(fields: [userId], references: [id])
  
  name        String
  description String?
  isPublic    Boolean  @default(false)
  tags        String[]
  conceptIds  String[] @db.ObjectId
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([userId])
  @@index([isPublic])
}

model Concept {
  // ... existing fields ...
  
  isFavorite  Boolean  @default(false)
  savedAt     DateTime?
  savedBy     String?  @db.ObjectId
}
```

---

## Phase 3: Intelligence & Personalization

### 3.1 AI Chat System

```prisma
model ChatConversation {
  id               String   @id @default(auto()) @map("_id") @db.ObjectId
  conversationId   String   @unique
  
  userId           String?  @db.ObjectId
  sessionToken     String
  
  messages         ChatMessage[]
  
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  
  @@index([userId])
  @@index([sessionToken])
}

model ChatMessage {
  id               String   @id @default(auto()) @map("_id") @db.ObjectId
  
  conversationId   String   @db.ObjectId
  conversation     ChatConversation @relation(fields: [conversationId], references: [id])
  
  role             MessageRole
  content          String
  
  metadata         Json?    // Intent, entities, action taken
  
  timestamp        DateTime @default(now())
  
  @@index([conversationId])
}

enum MessageRole {
  USER
  ASSISTANT
  SYSTEM
}
```

### 3.2 Style Profiles

```prisma
model UserStyleProfile {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  
  userId      String   @unique @db.ObjectId
  user        User     @relation(fields: [userId], references: [id])
  
  profileData Json     // Full StyleProfile object
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([userId])
}

model SearchHistory {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  
  userId      String?  @db.ObjectId
  sessionToken String
  
  query       String
  filters     Json?
  
  resultCount Int
  clicked     String[] @db.ObjectId // Concept/Product IDs clicked
  
  timestamp   DateTime @default(now())
  
  @@index([userId])
  @@index([timestamp])
}
```

---

## Phase 4: Innovation & Scale

### 4.1 AR Previews

```prisma
model ARPreview {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  
  conceptId   String   @db.ObjectId
  concept     Concept  @relation(fields: [conceptId], references: [id])
  
  sceneType   ARSceneType
  placement   Json
  imageUrl    String
  
  metadata    Json     // Scene analysis, product dims
  
  viewCount   Int      @default(0)
  shareCount  Int      @default(0)
  
  createdAt   DateTime @default(now())
  
  @@index([conceptId])
}

enum ARSceneType {
  ROOM
  PERSON
  SURFACE
}
```

### 4.2 Video Generation

```prisma
model VideoGenerationJob {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  
  conceptId   String   @db.ObjectId
  concept     Concept  @relation(fields: [conceptId], references: [id])
  
  style       VideoStyle
  duration    Int
  
  status      JobStatus
  progress    Int      @default(0)
  
  videoUrl    String?
  thumbnailUrl String?
  
  errorMessage String?
  
  createdAt   DateTime @default(now())
  completedAt DateTime?
  
  @@index([conceptId])
  @@index([status])
}

enum VideoStyle {
  SHOWCASE
  LIFESTYLE
  PROCESS
  SPIN360
}

enum JobStatus {
  QUEUED
  PROCESSING
  COMPLETED
  FAILED
}
```

### 4.3 Sustainability

```prisma
model SustainabilityScore {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  
  conceptId   String   @unique @db.ObjectId
  concept     Concept  @relation(fields: [conceptId], references: [id])
  
  scoreData   Json     // Full SustainabilityScore object
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([conceptId])
}
```

### 4.4 White-Label API

```prisma
model APIClient {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  
  name        String
  email       String   @unique
  company     String
  
  tier        APITier  @default(FREE)
  
  keys        APIKey[]
  
  createdAt   DateTime @default(now())
  
  @@index([email])
}

model APIKey {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  
  clientId    String   @db.ObjectId
  client      APIClient @relation(fields: [clientId], references: [id])
  
  key         String   @unique
  name        String
  
  tier        APITier
  isActive    Boolean  @default(true)
  
  rateLimit   Int      // Requests per minute
  usageCount  Int      @default(0)
  lastUsedAt  DateTime?
  
  createdAt   DateTime @default(now())
  expiresAt   DateTime?
  
  @@index([key])
  @@index([clientId])
}

enum APITier {
  FREE
  BASIC
  PRO
  ENTERPRISE
}

model APIUsage {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  
  keyId       String   @db.ObjectId
  key         APIKey   @relation(fields: [keyId], references: [id])
  
  endpoint    String
  method      String
  
  statusCode  Int
  responseTime Float   // milliseconds
  
  timestamp   DateTime @default(now())
  
  @@index([keyId])
  @@index([timestamp])
}
```

---

## Migration Strategy

### Phase 1 Migration
```bash
npx prisma migrate dev --name phase-1-foundation
```

### Phase 2 Migration
```bash
npx prisma migrate dev --name phase-2-engagement
```

### Phase 3 Migration
```bash
npx prisma migrate dev --name phase-3-intelligence
```

### Phase 4 Migration
```bash
npx prisma migrate dev --name phase-4-innovation
```

---

## Indexes Strategy

**High-Priority Indexes (Create First):**
- `Concept.userId` - Heavy read load
- `Concept.sessionToken` - Anonymous users
- `ChatMessage.conversationId` - Chat queries
- `ProgressEvent.sessionId` - Real-time progress
- `SharedConcept.shareToken` - Share links

**Composite Indexes (Performance Critical):**
```prisma
@@index([userId, createdAt])  // User timeline
@@index([status, createdAt])  // Status filtering
@@index([conceptId, timestamp]) // Concept history
```

**Text Search Indexes (MongoDB Full-Text):**
```prisma
@@index([searchText(name, description)]) // Search functionality
```

---

## Data Retention Policies

| Model | Retention | Cleanup Strategy |
|-------|-----------|------------------|
| ProgressEvent | 30 days | Archive to cold storage |
| ChatMessage | 90 days | Delete old conversations |
| AnalyticsEvent | 1 year | Aggregate to summary tables |
| SharedConcept | 1 year (if expired) | Soft delete |
| APIUsage | 3 months | Aggregate to daily summaries |

---

*All schema changes are versioned and backward compatible*
