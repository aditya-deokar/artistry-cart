# Phase 1: Foundation & Trust - Implementation Guide

**Duration:** 12 weeks (Q1 2026)  
**Team:** 2 Backend, 2 Frontend, 1 QA  
**Goal:** Reduce friction, build trust, establish technical foundation

---

## 📋 Overview

Phase 1 focuses on solving the most critical buyer pain points while establishing a solid technical foundation for future phases. We'll implement real-time feedback, concept refinement, transparent pricing, and mobile optimization.

---

## 🎯 Features & Timeline

### Week 1-3: Real-Time Progress Streaming

**Goal:** Let buyers see generation progress in real-time

#### Backend Tasks

**1. WebSocket Infrastructure (Week 1)**

```typescript
// apps/aivision-service/src/websocket/server.ts
import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifySessionToken } from '../middleware/auth.middleware';

export function initializeWebSocket(httpServer: HttpServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token || 
                  socket.handshake.headers.authorization;
    
    try {
      const session = await verifySessionToken(token);
      socket.data.sessionToken = session.sessionToken;
      socket.data.userId = session.userId;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  // Join concept-specific rooms
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('subscribe:concept', (conceptId: string) => {
      socket.join(`concept:${conceptId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

// Progress event emitter
export interface ProgressEvent {
  conceptId: string;
  stage: 'analyzing' | 'enhancing' | 'generating' | 'matching' | 'complete';
  progress: number; // 0-100
  message: string;
  data?: any;
  timestamp: Date;
}

export function emitProgress(io: SocketIOServer, event: ProgressEvent) {
  io.to(`concept:${event.conceptId}`).emit('progress', event);
  
  // Also store in database for reliability
  prisma.progressEvent.create({
    data: {
      conceptId: event.conceptId,
      stage: event.stage,
      progress: event.progress,
      message: event.message,
      data: event.data,
    },
  });
}
```

**2. Update Concept Generator Agent (Week 2)**

```typescript
// apps/aivision-service/src/agents/concept-generator.agent.ts

import { getWebSocketServer } from '../websocket/server';

async function analyzeIntent(state: ConceptState): Promise<Partial<ConceptState>> {
  const io = getWebSocketServer();
  
  // Emit progress
  emitProgress(io, {
    conceptId: state.conceptId,
    stage: 'analyzing',
    progress: 10,
    message: 'Understanding your request...',
    timestamp: new Date(),
  });

  // ... existing analysis logic ...

  emitProgress(io, {
    conceptId: state.conceptId,
    stage: 'analyzing',
    progress: 25,
    message: 'Identified product category and style',
    data: { category: parsed.category },
    timestamp: new Date(),
  });

  return { analyzedIntent: parsed };
}

async function enhancePrompt(state: ConceptState): Promise<Partial<ConceptState>> {
  const io = getWebSocketServer();
  
  emitProgress(io, {
    conceptId: state.conceptId,
    stage: 'enhancing',
    progress: 30,
    message: 'Crafting the perfect prompt...',
    timestamp: new Date(),
  });

  // ... existing enhancement logic ...

  return { enhancedPrompt: enhanced };
}

async function generateImages(state: ConceptState): Promise<Partial<ConceptState>> {
  const io = getWebSocketServer();
  const imageCount = state.imageCount;
  
  emitProgress(io, {
    conceptId: state.conceptId,
    stage: 'generating',
    progress: 40,
    message: `Generating ${imageCount} unique images...`,
    timestamp: new Date(),
  });

  // Generate images one by one with progress updates
  for (let i = 0; i < imageCount; i++) {
    const progress = 40 + (40 * (i + 1) / imageCount);
    
    emitProgress(io, {
      conceptId: state.conceptId,
      stage: 'generating',
      progress,
      message: `Generated image ${i + 1} of ${imageCount}`,
      timestamp: new Date(),
    });
  }

  return { generatedImages: images };
}
```

**3. Fallback REST Endpoint (Week 2)**

```typescript
// apps/aivision-service/src/controllers/generation.controller.ts

// For clients that can't use WebSocket
export const getConceptProgress: RequestHandler = async (req, res, next) => {
  try {
    const { conceptId } = req.params;
    
    // Get latest progress events
    const events = await prisma.progressEvent.findMany({
      where: { conceptId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Check if concept is complete
    const concept = await prisma.concept.findUnique({
      where: { id: conceptId },
      select: { status: true },
    });

    res.json({
      success: true,
      data: {
        conceptId,
        status: concept?.status || 'processing',
        events,
        isComplete: concept?.status === 'GENERATED',
      },
    });
  } catch (error) {
    next(error);
  }
};
```

#### Frontend Tasks

**4. WebSocket Client Integration (Week 3)**

```typescript
// user-ui/src/hooks/useConceptProgress.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface ProgressUpdate {
  stage: string;
  progress: number;
  message: string;
  data?: any;
}

export function useConceptProgress(conceptId: string) {
  const [progress, setProgress] = useState<ProgressUpdate>({
    stage: 'initializing',
    progress: 0,
    message: 'Starting generation...',
  });
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Connect to WebSocket
    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL, {
      auth: {
        token: localStorage.getItem('sessionToken'),
      },
    });

    newSocket.on('connect', () => {
      console.log('Connected to progress stream');
      newSocket.emit('subscribe:concept', conceptId);
    });

    newSocket.on('progress', (update: ProgressUpdate) => {
      setProgress(update);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from progress stream');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [conceptId]);

  return { progress, isConnected: socket?.connected || false };
}
```

**Database Migration:**

```prisma
// prisma/schema.prisma
model ProgressEvent {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  conceptId String   @db.ObjectId
  concept   Concept  @relation(fields: [conceptId], references: [id])
  
  stage     String   // analyzing, enhancing, generating, matching, complete
  progress  Int      // 0-100
  message   String
  data      Json?    // Additional data
  
  createdAt DateTime @default(now())
  
  @@index([conceptId, createdAt])
}
```

---

### Week 4-6: Concept Refinement Engine

**Goal:** Allow buyers to iterate on concepts without starting over

#### Backend Tasks

**1. Refinement Service (Week 4)**

```typescript
// apps/aivision-service/src/services/refinement.service.ts

export interface RefinementRequest {
  conceptId: string;
  userId?: string;
  sessionToken: string;
  changes: {
    instruction: string;        // "Make it more blue and smaller"
    changeColors?: string[];
    changeStyle?: string;
    changeMaterials?: string[];
    changeSize?: 'smaller' | 'larger' | 'same';
    keepElements?: string[];
    removeElements?: string[];
  };
}

export async function refineConcept(request: RefinementRequest) {
  // Get original concept
  const originalConcept = await prisma.concept.findUnique({
    where: { id: request.conceptId },
    include: {
      generatedProduct: true,
      refinements: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!originalConcept) {
    throw new Error('Concept not found');
  }

  // Build refinement prompt
  const refinementPrompt = buildRefinementPrompt(
    originalConcept.generationPrompt,
    originalConcept.enhancedPrompt,
    request.changes
  );

  // Generate refined concept
  const result = await generateConcept({
    prompt: refinementPrompt,
    conceptId: uuidv4(),
    sessionId: originalConcept.sessionId,
    mode: 'text',
    category: originalConcept.generatedProduct?.category,
    imageCount: 4,
  });

  // Store refinement relationship
  const refinement = await prisma.conceptRefinement.create({
    data: {
      originalConceptId: request.conceptId,
      refinedConceptId: result.conceptId,
      changes: request.changes as any,
      instruction: request.changes.instruction,
      userId: request.userId,
      sessionToken: request.sessionToken,
    },
  });

  return {
    success: true,
    refinedConcept: result,
    refinement,
  };
}

function buildRefinementPrompt(
  originalPrompt: string,
  enhancedPrompt: string | null,
  changes: RefinementRequest['changes']
): string {
  let prompt = `Original request: ${originalPrompt}\n\n`;
  prompt += `Refinement: ${changes.instruction}\n\n`;

  if (changes.changeColors?.length) {
    prompt += `Focus on these colors: ${changes.changeColors.join(', ')}\n`;
  }

  if (changes.changeStyle) {
    prompt += `Style adjustment: ${changes.changeStyle}\n`;
  }

  if (changes.changeMaterials?.length) {
    prompt += `Use materials: ${changes.changeMaterials.join(', ')}\n`;
  }

  if (changes.changeSize) {
    prompt += `Size: Make it ${changes.changeSize}\n`;
  }

  if (changes.keepElements?.length) {
    prompt += `Keep these elements: ${changes.keepElements.join(', ')}\n`;
  }

  if (changes.removeElements?.length) {
    prompt += `Remove these elements: ${changes.removeElements.join(', ')}\n`;
  }

  return prompt;
}
```

**2. Refinement Controller (Week 4)**

```typescript
// apps/aivision-service/src/controllers/refinement.controller.ts

export const refineConceptHandler: RequestHandler = async (req, res, next) => {
  const authReq = req as AuthenticatedRequest;
  
  try {
    const { conceptId } = req.params;
    const { instruction, colors, style, materials, size, keep, remove } = req.body;

    logger.info('Concept refinement request', {
      userId: authReq.user?.id,
      conceptId,
    });

    const result = await refineConcept({
      conceptId,
      userId: authReq.user?.id,
      sessionToken: authReq.sessionToken,
      changes: {
        instruction,
        changeColors: colors,
        changeStyle: style,
        changeMaterials: materials,
        changeSize: size,
        keepElements: keep,
        removeElements: remove,
      },
    });

    res.json({
      success: true,
      data: {
        originalConceptId: conceptId,
        refinedConceptId: result.refinedConcept.conceptId,
        images: result.refinedConcept.images,
        product: result.refinedConcept.product,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRefinementHistory: RequestHandler = async (req, res, next) => {
  try {
    const { conceptId } = req.params;

    const refinements = await prisma.conceptRefinement.findMany({
      where: {
        OR: [
          { originalConceptId: conceptId },
          { refinedConceptId: conceptId },
        ],
      },
      include: {
        originalConcept: {
          select: {
            id: true,
            primaryImageUrl: true,
            thumbnailUrl: true,
          },
        },
        refinedConcept: {
          select: {
            id: true,
            primaryImageUrl: true,
            thumbnailUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Build refinement tree
    const tree = buildRefinementTree(refinements);

    res.json({
      success: true,
      data: {
        conceptId,
        refinements,
        tree,
      },
    });
  } catch (error) {
    next(error);
  }
};
```

**3. Routes (Week 5)**

```typescript
// apps/aivision-service/src/routes/refinement.routes.ts

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { refineLimiter } from '../middleware/rate-limit.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { refinementSchema } from '../validators/schemas';
import {
  refineConceptHandler,
  getRefinementHistory,
} from '../controllers/refinement.controller';

const router = Router();

// Refine a concept
router.post(
  '/:conceptId/refine',
  refineLimiter,
  validateBody(refinementSchema),
  refineConceptHandler
);

// Get refinement history
router.get(
  '/:conceptId/refinements',
  getRefinementHistory
);

export default router;
```

**Database Migration:**

```prisma
model ConceptRefinement {
  id                 String   @id @default(auto()) @map("_id") @db.ObjectId
  
  originalConceptId  String   @db.ObjectId
  originalConcept    Concept  @relation("OriginalConcept", fields: [originalConceptId], references: [id])
  
  refinedConceptId   String   @db.ObjectId
  refinedConcept     Concept  @relation("RefinedConcept", fields: [refinedConceptId], references: [id])
  
  changes            Json     // Structured refinement instructions
  instruction        String   // Human-readable instruction
  
  userId             String?  @db.ObjectId
  sessionToken       String
  
  createdAt          DateTime @default(now())
  
  @@index([originalConceptId])
  @@index([refinedConceptId])
  @@index([sessionToken])
}

model Concept {
  // ... existing fields ...
  
  refinedFrom  ConceptRefinement[] @relation("RefinedConcept")
  refinedTo    ConceptRefinement[] @relation("OriginalConcept")
}
```

---

### Week 7-9: Artisan Quote System

**Goal:** Enable transparent pricing with real artisan quotes

#### Backend Tasks

**1. Quote Service (Week 7)**

```typescript
// apps/aivision-service/src/services/quote.service.ts

export interface QuoteRequest {
  conceptId: string;
  buyerId: string;
  specifications: {
    quantity: number;
    urgency: 'standard' | 'rush' | 'custom';
    customizations?: string[];
    deliveryAddress?: {
      city: string;
      state: string;
      pincode: string;
    };
  };
  artisanIds?: string[]; // Optional: request from specific artisans
}

export async function requestQuotes(request: QuoteRequest) {
  const concept = await prisma.concept.findUnique({
    where: { id: request.conceptId },
    include: {
      generatedProduct: true,
      artisanMatches: {
        where: { overallScore: { gte: 0.6 } },
        orderBy: { overallScore: 'desc' },
        take: 5,
        include: {
          seller: {
            include: { shops: true },
          },
        },
      },
    },
  });

  if (!concept) {
    throw new Error('Concept not found');
  }

  // Determine which artisans to contact
  const targetArtisans = request.artisanIds
    ? concept.artisanMatches.filter(m => request.artisanIds!.includes(m.sellerId))
    : concept.artisanMatches.slice(0, 3); // Top 3 matches

  // Create quote requests
  const quoteRequests = await Promise.all(
    targetArtisans.map(match =>
      prisma.quoteRequest.create({
        data: {
          conceptId: request.conceptId,
          buyerId: request.buyerId,
          sellerId: match.sellerId,
          shopId: match.seller.shops[0]?.id,
          
          specifications: request.specifications as any,
          
          status: 'PENDING',
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
          
          productDetails: {
            title: concept.generatedProduct?.title,
            category: concept.generatedProduct?.category,
            materials: concept.generatedProduct?.materials,
            estimatedPrice: {
              min: concept.generatedProduct?.estimatedPriceMin,
              max: concept.generatedProduct?.estimatedPriceMax,
            },
          } as any,
        },
      })
    )
  );

  // Notify artisans (via email, SMS, in-app notification)
  await notifyArtisans(quoteRequests);

  return {
    success: true,
    quoteRequestIds: quoteRequests.map(qr => qr.id),
    artisansContacted: targetArtisans.length,
  };
}

export async function submitQuote(quoteRequestId: string, quote: {
  sellerId: string;
  quotedPrice: number;
  estimatedDays: number;
  includesShipping: boolean;
  shippingCost?: number;
  willingness: 'eager' | 'interested' | 'maybe';
  message?: string;
  customizations?: string[];
  termsAndConditions?: string;
}) {
  // Verify seller owns this quote request
  const quoteRequest = await prisma.quoteRequest.findUnique({
    where: { id: quoteRequestId },
  });

  if (!quoteRequest || quoteRequest.sellerId !== quote.sellerId) {
    throw new Error('Invalid quote request');
  }

  if (quoteRequest.status !== 'PENDING') {
    throw new Error('Quote request is no longer active');
  }

  // Create quote
  const artisanQuote = await prisma.artisanQuote.create({
    data: {
      quoteRequestId,
      sellerId: quote.sellerId,
      
      quotedPrice: quote.quotedPrice,
      estimatedDays: quote.estimatedDays,
      includesShipping: quote.includesShipping,
      shippingCost: quote.shippingCost,
      willingness: quote.willingness,
      message: quote.message,
      customizations: quote.customizations,
      termsAndConditions: quote.termsAndConditions,
      
      status: 'SUBMITTED',
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  // Update quote request status
  await prisma.quoteRequest.update({
    where: { id: quoteRequestId },
    data: { status: 'QUOTED' },
  });

  // Notify buyer
  await notifyBuyer(quoteRequest.buyerId, artisanQuote);

  return artisanQuote;
}

export async function compareQuotes(conceptId: string, buyerId: string) {
  const quotes = await prisma.artisanQuote.findMany({
    where: {
      quoteRequest: {
        conceptId,
        buyerId,
      },
      status: 'SUBMITTED',
    },
    include: {
      seller: {
        include: {
          shops: {
            select: {
              name: true,
              ratings: true,
              totalOrders: true,
            },
          },
        },
      },
      quoteRequest: {
        select: {
          specifications: true,
        },
      },
    },
    orderBy: { quotedPrice: 'asc' },
  });

  // Calculate best value
  const withScores = quotes.map(quote => {
    const shop = quote.seller.shops[0];
    
    // Score based on price, rating, and delivery time
    const priceScore = 1 - (quote.quotedPrice / Math.max(...quotes.map(q => q.quotedPrice)));
    const ratingScore = shop.ratings / 5;
    const speedScore = 1 - (quote.estimatedDays / Math.max(...quotes.map(q => q.estimatedDays)));
    
    const overallScore = (priceScore * 0.4) + (ratingScore * 0.3) + (speedScore * 0.3);
    
    return {
      ...quote,
      scores: {
        price: priceScore,
        rating: ratingScore,
        speed: speedScore,
        overall: overallScore,
      },
      badges: [] as string[],
    };
  });

  // Assign badges
  withScores.forEach(quote => {
    if (quote.quotedPrice === Math.min(...withScores.map(q => q.quotedPrice))) {
      quote.badges.push('Lowest Price');
    }
    if (quote.seller.shops[0].ratings === Math.max(...withScores.map(q => q.seller.shops[0].ratings))) {
      quote.badges.push('Highest Rated');
    }
    if (quote.estimatedDays === Math.min(...withScores.map(q => q.estimatedDays))) {
      quote.badges.push('Fastest Delivery');
    }
    if (quote.scores.overall === Math.max(...withScores.map(q => q.scores.overall))) {
      quote.badges.push('Best Value');
    }
  });

  return {
    quotes: withScores,
    summary: {
      totalQuotes: quotes.length,
      priceRange: {
        min: Math.min(...quotes.map(q => q.quotedPrice)),
        max: Math.max(...quotes.map(q => q.quotedPrice)),
        average: quotes.reduce((sum, q) => sum + q.quotedPrice, 0) / quotes.length,
      },
      deliveryRange: {
        min: Math.min(...quotes.map(q => q.estimatedDays)),
        max: Math.max(...quotes.map(q => q.estimatedDays)),
      },
    },
  };
}
```

**Database Migration:**

```prisma
model QuoteRequest {
  id             String   @id @default(auto()) @map("_id") @db.ObjectId
  
  conceptId      String   @db.ObjectId
  concept        Concept  @relation(fields: [conceptId], references: [id])
  
  buyerId        String   @db.ObjectId
  buyer          User     @relation("BuyerQuotes", fields: [buyerId], references: [id])
  
  sellerId       String   @db.ObjectId
  seller         User     @relation("SellerQuotes", fields: [sellerId], references: [id])
  
  shopId         String?  @db.ObjectId
  
  specifications Json     // Quantity, urgency, customizations, delivery
  productDetails Json     // From AI generated product
  
  status         QuoteRequestStatus @default(PENDING)
  expiresAt      DateTime
  
  quotes         ArtisanQuote[]
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@index([conceptId])
  @@index([buyerId])
  @@index([sellerId])
  @@index([status, expiresAt])
}

model ArtisanQuote {
  id               String   @id @default(auto()) @map("_id") @db.ObjectId
  
  quoteRequestId   String   @db.ObjectId
  quoteRequest     QuoteRequest @relation(fields: [quoteRequestId], references: [id])
  
  sellerId         String   @db.ObjectId
  seller           User     @relation(fields: [sellerId], references: [id])
  
  quotedPrice      Float
  estimatedDays    Int
  includesShipping Boolean
  shippingCost     Float?
  
  willingness      WillingnessLevel
  message          String?
  customizations   String[]
  termsAndConditions String?
  
  status           QuoteStatus @default(SUBMITTED)
  validUntil       DateTime
  
  acceptedAt       DateTime?
  rejectedAt       DateTime?
  rejectionReason  String?
  
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  
  @@index([quoteRequestId])
  @@index([sellerId])
  @@index([status, validUntil])
}

enum QuoteRequestStatus {
  PENDING
  QUOTED
  ACCEPTED
  EXPIRED
  CANCELLED
}

enum QuoteStatus {
  SUBMITTED
  ACCEPTED
  REJECTED
  EXPIRED
  WITHDRAWN
}

enum WillingnessLevel {
  EAGER
  INTERESTED
  MAYBE
}
```

---

### Week 10-12: Mobile Optimization & Polish

**Goal:** Optimize for mobile users, add quick wins, polish UX

#### Backend Tasks

**1. Image Optimization Pipeline (Week 10)**

```typescript
// apps/aivision-service/src/services/image-optimization.service.ts

export interface ImageOptimizationOptions {
  source: 'camera' | 'gallery' | 'url';
  autoEnhance: boolean;
  targetSize?: 'thumbnail' | 'preview' | 'full';
  format?: 'webp' | 'jpeg' | 'png';
}

export async function optimizeImage(
  imageBuffer: Buffer,
  options: ImageOptimizationOptions
) {
  // Auto-enhance if requested
  if (options.autoEnhance) {
    imageBuffer = await autoEnhanceImage(imageBuffer);
  }

  // Generate multiple sizes
  const sizes = {
    thumbnail: { width: 300, height: 300 },
    preview: { width: 800, height: 800 },
    full: { width: 1920, height: 1920 },
  };

  const targetSize = sizes[options.targetSize || 'preview'];

  // Use sharp for image processing
  const sharp = require('sharp');
  
  const optimized = await sharp(imageBuffer)
    .resize(targetSize.width, targetSize.height, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .rotate() // Auto-rotate based on EXIF
    .normalize() // Auto-adjust levels
    .toFormat(options.format || 'webp', { quality: 85 })
    .toBuffer();

  return optimized;
}

async function autoEnhanceImage(buffer: Buffer): Promise<Buffer> {
  const sharp = require('sharp');
  
  return sharp(buffer)
    .normalize()           // Auto-levels
    .sharpen()             // Enhance sharpness
    .modulate({
      brightness: 1.1,     // Slight brightness boost
      saturation: 1.2,     // Enhance colors
    })
    .toBuffer();
}
```

**2. Quick Save/Favorite (Week 11)**

```typescript
// apps/aivision-service/src/controllers/favorites.controller.ts

export const saveConcept: RequestHandler = async (req, res, next) => {
  const authReq = req as AuthenticatedRequest;
  
  try {
    const { conceptId } = req.params;

    await prisma.concept.update({
      where: { id: conceptId },
      data: {
        isSaved: true,
        savedAt: new Date(),
        savedBy: authReq.user?.id,
      },
    });

    res.json({
      success: true,
      message: 'Concept saved to your library',
    });
  } catch (error) {
    next(error);
  }
};

export const toggleFavorite: RequestHandler = async (req, res, next) => {
  const authReq = req as AuthenticatedRequest;
  
  try {
    const { conceptId } = req.params;

    const concept = await prisma.concept.findUnique({
      where: { id: conceptId },
      select: { isFavorite: true },
    });

    await prisma.concept.update({
      where: { id: conceptId },
      data: {
        isFavorite: !concept?.isFavorite,
      },
    });

    res.json({
      success: true,
      isFavorite: !concept?.isFavorite,
    });
  } catch (error) {
    next(error);
  }
};
```

**3. Analytics Events (Week 12)**

```typescript
// apps/aivision-service/src/services/analytics.service.ts

export interface AnalyticsEvent {
  eventType: string;
  userId?: string;
  sessionToken: string;
  conceptId?: string;
  data?: Record<string, any>;
  platform: 'web' | 'mobile' | 'api';
  userAgent?: string;
}

export async function trackEvent(event: AnalyticsEvent) {
  await prisma.analyticsEvent.create({
    data: {
      eventType: event.eventType,
      userId: event.userId,
      sessionToken: event.sessionToken,
      conceptId: event.conceptId,
      data: event.data as any,
      platform: event.platform,
      userAgent: event.userAgent,
      timestamp: new Date(),
    },
  });

  // Also send to analytics service (e.g., Mixpanel, Amplitude)
  if (process.env.ANALYTICS_KEY) {
    await sendToAnalyticsService(event);
  }
}

// Track critical events
export const Events = {
  CONCEPT_GENERATED: 'concept_generated',
  CONCEPT_REFINED: 'concept_refined',
  CONCEPT_SAVED: 'concept_saved',
  CONCEPT_SHARED: 'concept_shared',
  QUOTE_REQUESTED: 'quote_requested',
  QUOTE_ACCEPTED: 'quote_accepted',
  SEARCH_PERFORMED: 'search_performed',
  GENERATION_ABANDONED: 'generation_abandoned',
};
```

---

## 🗄️ Database Migrations

Run these migrations in order:

```bash
# Week 1
npx prisma migrate dev --name add_progress_events

# Week 4
npx prisma migrate dev --name add_concept_refinements

# Week 7
npx prisma migrate dev --name add_quote_system

# Week 12
npx prisma migrate dev --name add_analytics_events
```

---

## 🧪 Testing Checklist

### Week 3: Real-Time Progress
- [ ] WebSocket connection establishes
- [ ] Progress events are emitted in correct order
- [ ] Fallback REST endpoint works
- [ ] Progress persists to database
- [ ] Handles disconnection/reconnection
- [ ] Load test: 100 concurrent generations

### Week 6: Concept Refinement
- [ ] Refinement prompt builds correctly
- [ ] Refinement tree is accurate
- [ ] History API works
- [ ] Refinement preserves key elements
- [ ] Rate limiting works (3 refinements/concept)

### Week 9: Quote System
- [ ] Quote requests sent to correct artisans
- [ ] Artisans receive notifications
- [ ] Quotes are submitted and validated
- [ ] Quote comparison logic is accurate
- [ ] Quote expiration works
- [ ] Buyer notifications work

### Week 12: Mobile & Polish
- [ ] Image optimization reduces file size
- [ ] Mobile upload flow is smooth
- [ ] Save/favorite works instantly
- [ ] Analytics events are tracked
- [ ] All APIs work on mobile network conditions

---

## 📊 Success Metrics (End of Phase 1)

| Metric | Baseline | Target | Measurement |
|--------|----------|---------|-------------|
| Time to first concept | 35s | < 20s | Avg generation time |
| Generation completion | 70% | > 90% | Completed / Started |
| Mobile conversion | 12% | > 16% | Mobile orders / concepts |
| Quote response rate | N/A | > 75% | Quotes / Requests |
| Refinement usage | N/A | > 40% | Users who refine |

---

## 🚀 Deployment Plan

### Week 11: Staging Deployment
1. Deploy to staging environment
2. Run full integration test suite
3. Performance testing (load, stress)
4. Security audit (OWASP)
5. Mobile device testing (iOS/Android)

### Week 12: Production Rollout
1. **Monday:** Feature flags enabled for 10% of users
2. **Wednesday:** Monitor metrics, increase to 50%
3. **Friday:** Full rollout to 100%
4. **Weekend:** On-call monitoring

### Rollback Plan
- Feature flags can disable new features instantly
- Database migrations are backward compatible
- WebSocket fallback to REST polling

---

## 📝 Documentation Deliverables

- [ ] API documentation (OpenAPI/Swagger)
- [ ] WebSocket protocol documentation
- [ ] Quote system integration guide for artisans
- [ ] Mobile SDK documentation
- [ ] Monitoring & alerting runbook
- [ ] Incident response procedures

---

## 👥 Team Assignments

**Backend Developer 1:**
- WebSocket infrastructure
- Concept refinement engine
- Quote service backend

**Backend Developer 2:**
- Progress event system
- Image optimization
- Analytics tracking

**Frontend Developer 1:**
- WebSocket client integration
- Progress UI components
- Refinement interface

**Frontend Developer 2:**
- Mobile optimization
- Quote comparison UI
- Save/favorite features

**QA Engineer:**
- Test automation
- Load testing
- Mobile device testing
- Security testing

---

## 🎯 Next Steps

After Phase 1 completion:
1. Retrospective meeting
2. Metrics review against targets
3. User feedback collection
4. Technical debt assessment
5. Phase 2 kickoff planning

---

*Phase 1 sets the foundation for all future enhancements. Focus on quality and stability.*
