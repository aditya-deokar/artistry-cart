# AI Vision API - Database Schema Design

> **Document:** 02-DATABASE-SCHEMA.md  
> **Database:** MongoDB with Prisma ORM  
> **Updated:** December 28, 2024 (Post Technical Review)

---

## 📊 Collections Overview

| Collection | Purpose |
|------------|---------|
| `vision_sessions` | Track user generation sessions |
| `concepts` | Store AI-generated concept data |
| `concept_images` | Image metadata and embeddings |
| `ai_generated_products` | LLM-generated product details |
| `artisan_matches` | Concept-to-artisan matching |
| `custom_orders` | Custom order requests |
| `visual_search_logs` | Search analytics |
| `rate_limit_entries` | **NEW:** MongoDB-based rate limiting |
| `product_embeddings` | **NEW:** Embeddings for existing products |
| `api_usage_logs` | **NEW:** Cost and usage tracking |

---

## 🗄️ Prisma Schema

Add these models to `prisma/schema.prisma`:

```prisma
// ============================================
// AI VISION MODELS
// ============================================

// Vision Session - Tracks a user's generation session
model VisionSession {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  userId       String?  @db.ObjectId
  sessionToken String   @unique // For anonymous users
  
  // Session metadata
  mode         VisionMode
  status       SessionStatus @default(ACTIVE)
  
  // Input data
  prompt           String?
  baseProductId    String? @db.ObjectId
  uploadedImageUrl String?
  
  // Generation settings
  settings    Json?    // { category, style, material, priceRange }
  
  // Results
  concepts    Concept[]
  
  // Request tracking
  requestId   String?  // For tracing
  
  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  expiresAt   DateTime // Sessions expire after 24h
  
  @@index([userId])
  @@index([sessionToken])
  @@index([status])
  @@index([expiresAt]) // TTL index for auto-cleanup
}

// Concept - Individual AI-generated concept
model Concept {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  
  // Session relation
  sessionId       String   @db.ObjectId
  session         VisionSession @relation(fields: [sessionId], references: [id])
  
  // Generation data
  generationPrompt String  // The actual prompt sent to AI
  enhancedPrompt  String?  // LLM-enhanced version
  
  // Images (stored in ImageKit)
  images          ConceptImage[]
  primaryImageUrl String   // ImageKit URL
  thumbnailUrl    String?  // ImageKit thumbnail URL
  
  // AI Analysis
  analyzedFeatures Json?   // { category, style, colors, materials, etc. }
  
  // Pricing estimate
  estimatedPrice  Json?    // { min, max, confidence }
  
  // User interactions
  isSaved         Boolean  @default(false)
  isFavorite      Boolean  @default(false)
  viewCount       Int      @default(0)
  
  // Artisan matching
  artisanMatches  ArtisanMatch[]
  sentToArtisans  String[] @db.ObjectId // Seller IDs
  
  // Link to generated product data
  generatedProduct AIGeneratedProduct?
  
  // Status
  status          ConceptStatus @default(GENERATED)
  
  // Error tracking
  generationError String?  // If generation partially failed
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([sessionId])
  @@index([status])
  @@index([isSaved])
}

// Concept Image - Individual image with embedding (stored in ImageKit)
model ConceptImage {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  
  conceptId       String   @db.ObjectId
  concept         Concept  @relation(fields: [conceptId], references: [id])
  
  // ImageKit URLs
  originalUrl     String   // ImageKit original URL
  thumbnailUrl    String   // ImageKit thumbnail URL
  
  // ImageKit metadata
  fileId          String   // ImageKit file ID for deletion
  filePath        String   // ImageKit file path
  fileSize        Int
  mimeType        String
  dimensions      Json     // { width, height }
  
  // Vector embedding for similarity search
  embedding       Float[]  // 768 dimensions (CLIP)
  embeddingModel  String?  @default("clip-vit-large-patch14")
  
  // Image analysis (from Gemini Vision)
  dominantColors  String[]
  detectedObjects String[]
  styleKeywords   String[]
  
  // Ordering
  position        Int      @default(0)
  isPrimary       Boolean  @default(false)
  
  createdAt       DateTime @default(now())
  
  @@index([conceptId])
}

// ============================================
// AI Generated Product - LLM generates structured product data
// ============================================
model AIGeneratedProduct {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  
  // Link to concept
  conceptId       String   @unique @db.ObjectId
  concept         Concept  @relation(fields: [conceptId], references: [id])
  
  // Generated Product Fields (matching products schema)
  title           String
  description     String
  detailedDescription String
  
  // Categorization (validated against site_config)
  category        String
  subCategory     String
  tags            String[]
  
  // Specifications
  colors          String[]
  sizes           String[]
  materials       String[]
  
  // Custom specifications generated by LLM
  customSpecifications Json?
  
  // Pricing (LLM estimation)
  estimatedPriceMin Float
  estimatedPriceMax Float
  priceConfidence   Float   // 0-1 confidence score
  pricingRationale  String?
  
  // Artisan Requirements
  requiredSkills    String[]
  estimatedDuration String?
  complexityLevel   String  // "simple", "moderate", "complex", "expert"
  
  // Style & Design
  styleKeywords     String[]
  designNotes       String?
  
  // Feasibility
  feasibilityScore  Float   // 0-100
  feasibilityNotes  String?
  
  // Generation metadata
  llmModel          String  @default("gemini-1.5-pro")
  promptUsed        String
  generationVersion Int     @default(1)
  
  // Validation status
  isValidated       Boolean @default(false)
  validationErrors  String[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([category])
  @@index([feasibilityScore])
}

// ============================================
// RATE LIMITING (MongoDB-based, no Redis)
// ============================================
model RateLimitEntry {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  key         String   @unique  // "userId:endpoint" or "ip:endpoint"
  count       Int      @default(1)
  windowStart DateTime @default(now())
  
  @@index([windowStart]) // For cleanup
}

// ============================================
// PRODUCT EMBEDDINGS (for visual search)
// ============================================
model ProductEmbedding {
  id             String   @id @default(auto()) @map("_id") @db.ObjectId
  productId      String   @unique @db.ObjectId
  embedding      Float[]  // 768 dimensions
  embeddingModel String   @default("clip-vit-large-patch14")
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@index([productId])
}

// ============================================
// API USAGE TRACKING
// ============================================
model APIUsageLog {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  userId        String?  @db.ObjectId
  sessionToken  String?
  requestId     String?
  
  endpoint      String
  service       String   // "gemini-pro", "gemini-image", "imagekit", "huggingface"
  
  // Usage metrics
  inputTokens   Int?
  outputTokens  Int?
  imagesGenerated Int?
  
  // Cost estimation
  estimatedCost Float?
  
  // Status
  success       Boolean
  errorMessage  String?
  durationMs    Int
  
  createdAt     DateTime @default(now())
  
  @@index([userId])
  @@index([createdAt])
  @@index([service])
}

// ============================================
// ARTISAN MATCHING
// ============================================
model ArtisanMatch {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  
  conceptId       String   @db.ObjectId
  concept         Concept  @relation(fields: [conceptId], references: [id])
  
  sellerId        String   @db.ObjectId
  
  // Matching scores
  overallScore    Float    // 0-100
  scores          Json     // { style, material, expertise, availability, price }
  
  // Match reasons
  matchReasons    String[]
  
  // Artisan response
  status          MatchStatus @default(PENDING)
  responseMessage String?
  proposedPrice   Float?
  proposedTimeline String?
  
  createdAt       DateTime @default(now())
  respondedAt     DateTime?
  
  @@unique([conceptId, sellerId])
  @@index([conceptId])
  @@index([sellerId])
  @@index([status])
}

// ============================================
// CUSTOM ORDERS
// ============================================
model CustomOrder {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  
  conceptId       String   @db.ObjectId
  buyerId         String   @db.ObjectId
  sellerId        String   @db.ObjectId
  
  description     String
  conceptImageUrls String[]
  referenceImages String[]
  
  specifications  Json
  
  agreedPrice     Float
  platformFee     Float
  totalAmount     Float
  
  estimatedDays   Int
  deadline        DateTime?
  
  milestones      CustomOrderMilestone[]
  messages        CustomOrderMessage[]
  
  paymentStatus   PaymentStatus @default(PENDING)
  escrowId        String?
  
  status          CustomOrderStatus @default(PENDING_ACCEPTANCE)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  completedAt     DateTime?
  
  @@index([buyerId])
  @@index([sellerId])
  @@index([status])
}

model CustomOrderMilestone {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  
  customOrderId   String   @db.ObjectId
  customOrder     CustomOrder @relation(fields: [customOrderId], references: [id])
  
  title           String
  description     String?
  percentage      Int
  amount          Float
  
  status          MilestoneStatus @default(PENDING)
  progressImages  String[]
  
  dueDate         DateTime?
  completedAt     DateTime?
  approvedAt      DateTime?
  
  @@index([customOrderId])
}

model CustomOrderMessage {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  
  customOrderId   String   @db.ObjectId
  customOrder     CustomOrder @relation(fields: [customOrderId], references: [id])
  
  senderId        String   @db.ObjectId
  senderType      String
  
  content         String
  attachments     Json[]
  
  messageType     String   @default("text")
  metadata        Json?
  
  createdAt       DateTime @default(now())
  readAt          DateTime?
  
  @@index([customOrderId])
}

// Visual Search Log
model VisualSearchLog {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  
  userId          String?  @db.ObjectId
  sessionToken    String
  
  imageUrl        String
  imageEmbedding  Float[]?
  
  filters         Json?
  threshold       Float    @default(0.7)
  
  resultCount     Int
  topMatches      Json[]
  
  clickedProductId String? @db.ObjectId
  generatedConcept Boolean @default(false)
  
  searchDurationMs Int
  
  createdAt       DateTime @default(now())
  
  @@index([userId])
  @@index([createdAt])
}

// ============================================
// ENUMS
// ============================================

enum VisionMode {
  TEXT_TO_IMAGE
  PRODUCT_VARIATION
  VISUAL_SEARCH
}

enum SessionStatus {
  ACTIVE
  COMPLETED
  EXPIRED
  CANCELLED
}

enum ConceptStatus {
  GENERATING
  GENERATED
  PARTIALLY_GENERATED  // Some images failed
  SAVED
  SENT_TO_ARTISANS
  IN_PROGRESS
  REALIZED
  ARCHIVED
  FAILED
}

enum MatchStatus {
  PENDING
  VIEWED
  INTERESTED
  QUOTED
  DECLINED
  ACCEPTED
}

enum CustomOrderStatus {
  PENDING_ACCEPTANCE
  ACCEPTED
  IN_PROGRESS
  AWAITING_APPROVAL
  REVISION_REQUESTED
  COMPLETED
  CANCELLED
  DISPUTED
}

enum MilestoneStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  APPROVED
  REVISION_NEEDED
}

enum PaymentStatus {
  PENDING
  DEPOSIT_PAID
  PARTIALLY_PAID
  FULLY_PAID
  REFUNDED
}
```

---

## 🔍 MongoDB Indexes

```javascript
// TTL Index for session cleanup (run once in MongoDB shell)
db.VisionSession.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 })

// Rate limit cleanup (older than 2 minutes)
db.RateLimitEntry.createIndex({ "windowStart": 1 }, { expireAfterSeconds: 120 })

// Vector search index for concept images
db.ConceptImage.createIndex(
  { "embedding": "vectorSearch" },
  {
    name: "concept_image_embedding_index",
    vectorSearchOptions: {
      dimensions: 768,
      similarity: "cosine"
    }
  }
)

// Vector search index for products
db.ProductEmbedding.createIndex(
  { "embedding": "vectorSearch" },
  {
    name: "product_embedding_index",
    vectorSearchOptions: {
      dimensions: 768,
      similarity: "cosine"
    }
  }
)
```

---

## 🖼️ ImageKit Folder Structure

```
/ai-vision/
├── concepts/
│   └── {conceptId}/
│       ├── concept_{timestamp}_0.png
│       ├── concept_{timestamp}_1.png
│       └── ...
├── uploads/
│   └── {sessionToken}/
│       └── reference_{timestamp}.{ext}
└── progress/
    └── {orderId}/
        └── milestone_{milestoneId}_{timestamp}.{ext}
```

---

*Previous: [01-OVERVIEW.md](./01-OVERVIEW.md) | Next: [03-API-ENDPOINTS.md](./03-API-ENDPOINTS.md)*
