# AI Vision API - Technical Review & Risk Mitigation

> **Document:** 06-TECHNICAL-REVIEW.md  
> **Reviewer:** Senior Software Developer  
> **Date:** December 28, 2024  
> **Status:** Pre-Implementation Review

---

## 📋 Executive Summary

This document identifies potential issues, architectural concerns, and risks in the AI Vision API implementation plan. Each issue includes severity, impact, and recommended solutions to ensure the system works without errors.

---

## 🔴 Critical Issues (Must Fix Before Implementation)

### Issue #1: Rate Limiting Without Redis

**Problem:**  
The plan removes Redis but still requires rate limiting. In-memory rate limiting doesn't work across multiple server instances (horizontal scaling).

**Impact:** High - Users can bypass rate limits by hitting different instances.

**Solution:**
```typescript
// Option A: Use MongoDB-based rate limiting
// src/middleware/rate-limit.middleware.ts
import { prisma } from '@/config/database';

interface RateLimitEntry {
  id: string;
  key: string;
  count: number;
  windowStart: Date;
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = new Date(Date.now() - windowMs);
  
  // Atomic upsert with increment
  const result = await prisma.rateLimitEntry.upsert({
    where: { key },
    update: {
      count: {
        increment: 1,
      },
      // Reset if window expired
      windowStart: {
        set: new Date(),
      },
    },
    create: {
      key,
      count: 1,
      windowStart: new Date(),
    },
  });
  
  const allowed = result.count <= limit;
  return { allowed, remaining: Math.max(0, limit - result.count) };
}

// Add this model to schema.prisma:
// model RateLimitEntry {
//   id          String   @id @default(auto()) @map("_id") @db.ObjectId
//   key         String   @unique  // "userId:endpoint" or "ip:endpoint"
//   count       Int      @default(0)
//   windowStart DateTime @default(now())
//   @@index([windowStart]) // TTL index
// }
```

---

### Issue #2: Gemini API Package Name Incorrect

**Problem:**  
The code uses `@google/genai` but the correct package is `@google/generative-ai`.

**Impact:** Critical - Code won't compile.

**Solution:**
```bash
# Correct package installation
pnpm add @google/generative-ai

# Correct import
import { GoogleGenerativeAI } from '@google/generative-ai';

// Alternative: Use the newer Google AI SDK
pnpm add @google-ai/generativelanguage
```

```typescript
// Corrected config/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

export const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// For image generation
export async function generateImage(prompt: string) {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-exp', // Check latest model name
  });
  
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      // Enable image output if supported
      responseModalities: ['image', 'text'],
    },
  });
  
  return result;
}
```

---

### Issue #3: Missing Error Handling in LangGraph Workflow

**Problem:**  
The LangGraph workflow has no error handling. If image generation fails, the entire workflow crashes.

**Impact:** Critical - Partial failures cause complete request failures.

**Solution:**
```typescript
// src/agents/concept-generator.agent.ts

// Add error handling node
async function handleError(state: ConceptState) {
  console.error('Workflow error:', state.error);
  
  // Decide recovery strategy
  if (state.attempts < 3 && state.error?.includes('rate_limit')) {
    // Wait and retry
    await new Promise(resolve => setTimeout(resolve, 5000));
    return { attempts: state.attempts + 1, error: null };
  }
  
  // Return partial results if available
  return {
    error: state.error,
    // Keep any successful results
    generatedImages: state.generatedImages,
  };
}

// Add conditional routing
function routeAfterGenerate(state: ConceptState) {
  if (state.generatedImages.length === 0) {
    return 'handleError';
  }
  return 'productGen';
}

// Updated graph with error handling
export const conceptGeneratorGraph = new StateGraph<ConceptState>({...})
  .addNode('analyze', wrapWithErrorHandler(analyzeIntent))
  .addNode('enhance', wrapWithErrorHandler(enhancePrompt))
  .addNode('generate', wrapWithErrorHandler(generateImages))
  .addNode('productGen', wrapWithErrorHandler(generateProduct))
  .addNode('handleError', handleError)
  .addConditionalEdges('generate', routeAfterGenerate, {
    handleError: 'handleError',
    productGen: 'productGen',
  })
  .addEdge('handleError', '__end__')
  .compile();

// Error wrapper utility
function wrapWithErrorHandler<T>(fn: (state: T) => Promise<Partial<T>>) {
  return async (state: T): Promise<Partial<T>> => {
    try {
      return await fn(state);
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      } as Partial<T>;
    }
  };
}
```

---

### Issue #4: JSON Parsing Without Validation

**Problem:**  
LLM responses are parsed with `JSON.parse()` directly. LLMs can return malformed JSON or unexpected structures.

**Impact:** Critical - Runtime crashes on invalid LLM output.

**Solution:**
```typescript
// src/utils/helpers/llm-parser.ts
import { z } from 'zod';

// Define strict schema for product generation
export const GeneratedProductSchema = z.object({
  title: z.string().max(80),
  description: z.string().min(100).max(300),
  detailedDescription: z.string().min(400).max(1000),
  category: z.string(),
  subCategory: z.string(),
  tags: z.array(z.string()).min(3).max(15),
  colors: z.array(z.string()).min(1),
  sizes: z.array(z.string()).default([]),
  materials: z.array(z.string()).min(1),
  customSpecifications: z.record(z.any()).optional(),
  estimatedPriceMin: z.number().positive(),
  estimatedPriceMax: z.number().positive(),
  priceConfidence: z.number().min(0).max(1),
  pricingRationale: z.string().optional(),
  requiredSkills: z.array(z.string()),
  estimatedDuration: z.string(),
  complexityLevel: z.enum(['simple', 'moderate', 'complex', 'expert']),
  styleKeywords: z.array(z.string()),
  designNotes: z.string().optional(),
  feasibilityScore: z.number().min(0).max(100),
  feasibilityNotes: z.string().optional(),
});

export type GeneratedProductData = z.infer<typeof GeneratedProductSchema>;

// Safe parser with retry
export async function safeParseLLMResponse<T>(
  responseContent: string,
  schema: z.ZodSchema<T>,
  retryFn?: () => Promise<string>
): Promise<T> {
  // Try to extract JSON from response
  const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    if (retryFn) {
      const retryResponse = await retryFn();
      return safeParseLLMResponse(retryResponse, schema);
    }
    throw new Error('No JSON found in LLM response');
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return schema.parse(parsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Schema validation failed:', error.errors);
      // Attempt to fix common issues
      // or retry with more explicit prompt
    }
    throw error;
  }
}

// Usage in product-generator.service.ts
const productData = await safeParseLLMResponse(
  response.content as string,
  GeneratedProductSchema
);
```

---

## 🟠 High Priority Issues

### Issue #5: No Retry Logic for External APIs

**Problem:**  
Gemini API, HuggingFace API, and ImageKit can have transient failures. No retry logic implemented.

**Solution:**
```typescript
// src/utils/helpers/retry.ts
export interface RetryOptions {
  maxRetries: number;
  delayMs: number;
  backoffMultiplier: number;
  retryableErrors?: string[];
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {
    maxRetries: 3,
    delayMs: 1000,
    backoffMultiplier: 2,
  }
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Check if error is retryable
      const isRetryable = 
        error.message?.includes('rate_limit') ||
        error.message?.includes('timeout') ||
        error.message?.includes('503') ||
        error.message?.includes('ECONNRESET');
      
      if (!isRetryable || attempt === options.maxRetries) {
        throw error;
      }
      
      const delay = options.delayMs * Math.pow(options.backoffMultiplier, attempt);
      console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

// Usage
const images = await withRetry(
  () => generateConceptImages(options, conceptId),
  { maxRetries: 3, delayMs: 2000, backoffMultiplier: 2 }
);
```

---

### Issue #6: No Request Timeout

**Problem:**  
Image generation can take 10-30+ seconds. No timeouts set means requests can hang indefinitely.

**Solution:**
```typescript
// src/middleware/timeout.middleware.ts
import { Request, Response, NextFunction } from 'express';

export function timeoutMiddleware(timeoutMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(504).json({
          success: false,
          error: {
            code: 'TIMEOUT',
            message: 'Request timed out',
          },
        });
      }
    }, timeoutMs);

    res.on('finish', () => clearTimeout(timeout));
    res.on('close', () => clearTimeout(timeout));
    
    next();
  };
}

// Apply different timeouts per route
app.use('/api/v1/ai/generate', timeoutMiddleware(60000)); // 60s for generation
app.use('/api/v1/ai/search', timeoutMiddleware(10000));    // 10s for search
app.use('/api/v1/ai', timeoutMiddleware(30000));           // 30s default
```

---

### Issue #7: BullMQ Without Redis

**Problem:**  
BullMQ is listed as a dependency for job queues, but BullMQ **requires Redis**. Since Redis is removed, this won't work.

**Solution:**
```typescript
// Option A: Use a MongoDB-based queue (Agenda.js)
pnpm add agenda

// src/config/queue.ts
import { Agenda } from 'agenda';

export const agenda = new Agenda({
  db: { address: process.env.DATABASE_URL!, collection: 'agendaJobs' },
  processEvery: '30 seconds',
});

// Define jobs
agenda.define('generateEmbeddings', async (job) => {
  const { conceptId, imageUrl } = job.attrs.data;
  await generateAndSaveEmbedding(conceptId, imageUrl);
});

agenda.define('cleanupExpiredSessions', async () => {
  // Already handled by MongoDB TTL, but can add extra logic
});

// Start agenda
await agenda.start();

// Queue a job
await agenda.schedule('in 5 seconds', 'generateEmbeddings', { 
  conceptId, 
  imageUrl 
});

// Option B: Use simple in-process queue for MVP
// (Not recommended for production)
```

---

### Issue #8: ImageKit base64 Upload Format

**Problem:**  
Gemini returns base64 images that need proper formatting for ImageKit upload.

**Solution:**
```typescript
// src/config/imagekit.ts
export async function uploadConceptImage(
  base64Data: string,
  conceptId: string,
  index: number
): Promise<{ url: string; fileId: string; filePath: string }> {
  // Gemini returns raw base64, ImageKit needs data URI format
  const dataUri = base64Data.startsWith('data:') 
    ? base64Data 
    : `data:image/png;base64,${base64Data}`;

  try {
    const response = await imagekit.upload({
      file: dataUri,
      fileName: `concept_${Date.now()}_${index}.png`,
      folder: `${AI_VISION_FOLDER}/concepts/${conceptId}`,
      useUniqueFileName: true,
    });

    return {
      url: response.url,
      thumbnailUrl: imagekit.url({
        path: response.filePath,
        transformation: [{ height: '300', width: '300', focus: 'auto' }],
      }),
      fileId: response.fileId,
      filePath: response.filePath,
    };
  } catch (error) {
    console.error('ImageKit upload failed:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}
```

---

### Issue #9: Missing Authentication Middleware

**Problem:**  
API endpoints reference `req.user` but no auth middleware is defined.

**Solution:**
```typescript
// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  sessionToken?: string; // For anonymous users
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const sessionToken = req.headers['x-session-token'] as string;
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        email: string;
        role: string;
      };
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };
    } catch (error) {
      // Invalid token - treat as anonymous
    }
  }
  
  // Allow anonymous access with session token
  if (!req.user && sessionToken) {
    req.sessionToken = sessionToken;
  } else if (!req.user) {
    // Generate new session token for anonymous users
    req.sessionToken = generateSessionToken();
  }
  
  next();
}

// Optional auth - allows both authenticated and anonymous
export function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  return authMiddleware(req, res, next);
}

// Required auth - must be logged in
export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  authMiddleware(req, res, () => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }
    next();
  });
}
```

---

## 🟡 Medium Priority Issues

### Issue #10: Missing Input Validation

**Problem:**  
Request bodies are not validated before processing.

**Solution:**
```typescript
// src/validators/generation.validators.ts
import { z } from 'zod';

export const TextToImageSchema = z.object({
  prompt: z.string()
    .min(10, 'Prompt must be at least 10 characters')
    .max(500, 'Prompt must be at most 500 characters'),
  category: z.string().optional(),
  style: z.string().optional(),
  material: z.string().optional(),
  priceRange: z.object({
    min: z.number().positive().optional(),
    max: z.number().positive().optional(),
  }).optional().refine(
    data => !data || !data.min || !data.max || data.min <= data.max,
    'Min price must be less than max price'
  ),
  referenceImageUrl: z.string().url().optional(),
  count: z.number().int().min(1).max(6).default(4),
});

// Validation middleware factory
export function validate<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body',
            details: error.errors,
          },
        });
      }
      next(error);
    }
  };
}

// Usage in routes
router.post(
  '/generate/text-to-image',
  validate(TextToImageSchema),
  textToImageController
);
```

---

### Issue #11: No Graceful Shutdown

**Problem:**  
When server restarts, in-flight requests are dropped.

**Solution:**
```typescript
// src/main.ts
import { Server } from 'http';

let server: Server;
let isShuttingDown = false;

async function gracefulShutdown(signal: string) {
  console.log(`${signal} received. Starting graceful shutdown...`);
  isShuttingDown = true;
  
  // Stop accepting new connections
  server.close(async () => {
    console.log('HTTP server closed');
    
    // Close database connections
    await prisma.$disconnect();
    
    // Close agenda if using
    // await agenda.stop();
    
    console.log('Graceful shutdown complete');
    process.exit(0);
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Health check that respects shutdown
app.get('/health', (req, res) => {
  if (isShuttingDown) {
    return res.status(503).json({ status: 'shutting_down' });
  }
  res.json({ status: 'healthy' });
});
```

---

### Issue #12: Vector Search on Unindexed Products

**Problem:**  
Visual search requires embeddings for all products, but existing products don't have embeddings.

**Solution:**
```typescript
// scripts/backfill-embeddings.ts
import { prisma } from '@/config/database';
import { generateImageEmbedding } from '@/services/search/embedding.service';

async function backfillProductEmbeddings() {
  console.log('Starting product embedding backfill...');
  
  // Get products without embeddings
  const products = await prisma.products.findMany({
    where: {
      status: 'Active',
      isDeleted: false,
    },
    select: {
      id: true,
      images: true,
      title: true,
    },
  });
  
  console.log(`Found ${products.length} products to process`);
  
  let processed = 0;
  let failed = 0;
  
  for (const product of products) {
    try {
      const primaryImage = (product.images as any[])?.[0];
      if (!primaryImage?.url) {
        console.log(`Skipping ${product.id}: no image`);
        continue;
      }
      
      const embedding = await generateImageEmbedding(primaryImage.url);
      
      // Create or update product embedding
      await prisma.productEmbedding.upsert({
        where: { productId: product.id },
        update: { embedding, updatedAt: new Date() },
        create: {
          productId: product.id,
          embedding,
          embeddingModel: 'clip-vit-large-patch14',
        },
      });
      
      processed++;
      if (processed % 10 === 0) {
        console.log(`Processed ${processed}/${products.length}`);
      }
      
      // Rate limit: 1 request per second
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`Failed to process ${product.id}:`, error);
      failed++;
    }
  }
  
  console.log(`Backfill complete: ${processed} processed, ${failed} failed`);
}

// Add ProductEmbedding model to schema
// model ProductEmbedding {
//   id             String   @id @default(auto()) @map("_id") @db.ObjectId
//   productId      String   @unique @db.ObjectId
//   embedding      Float[]
//   embeddingModel String
//   createdAt      DateTime @default(now())
//   updatedAt      DateTime @updatedAt
// }
```

---

## 🟢 Low Priority Issues

### Issue #13: Console.log for Errors

**Problem:**  
Using `console.error` instead of structured logging.

**Solution:**
```typescript
// src/utils/logger.ts
import { createLogger, format, transports } from 'winston';

export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.Console(),
    // Add file transport for production
  ],
});

// Usage
logger.error('Image generation failed', { 
  conceptId, 
  error: error.message,
  stack: error.stack 
});
```

---

### Issue #14: No API Versioning Strategy

**Problem:**  
API uses `/api/v1/ai` but no strategy for version upgrades.

**Solution:**
```typescript
// src/routes/index.ts
import v1Routes from './v1';
// Future: import v2Routes from './v2';

// Version routing
app.use('/api/v1/ai', v1Routes);
// app.use('/api/v2/ai', v2Routes);

// Deprecation headers for old versions
app.use('/api/v1', (req, res, next) => {
  res.setHeader('Deprecation', 'false'); // Set to date when deprecated
  res.setHeader('Sunset', ''); // Set date when discontinued
  next();
});
```

---

### Issue #15: HuggingFace CLIP Rate Limits

**Problem:**  
HuggingFace Inference API has rate limits on free tier.

**Solution:**
```typescript
// Consider self-hosting CLIP or using Replicate
// Option A: Use Replicate API
pnpm add replicate

import Replicate from 'replicate';

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

export async function generateImageEmbedding(imageUrl: string) {
  const output = await replicate.run(
    "andreasjansson/clip-features:...",
    { input: { image: imageUrl } }
  );
  return output;
}

// Option B: Local CLIP with ONNX
// Requires more setup but no rate limits
```

---

## 📝 Additional Recommendations

### 1. Add Health Checks for External Services
```typescript
app.get('/health/detailed', async (req, res) => {
  const checks = {
    database: await checkDatabase(),
    gemini: await checkGeminiAPI(),
    imagekit: await checkImageKit(),
    huggingface: await checkHuggingFace(),
  };
  
  const healthy = Object.values(checks).every(c => c.status === 'ok');
  res.status(healthy ? 200 : 503).json(checks);
});
```

### 2. Add Request ID Tracking
```typescript
import { v4 as uuidv4 } from 'uuid';

app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});
```

### 3. Add Cost Tracking
```typescript
// Track API usage costs
model APIUsageLog {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  userId      String?  @db.ObjectId
  endpoint    String
  service     String   // "gemini", "imagekit", "huggingface"
  tokens      Int?     // For LLM calls
  images      Int?     // For image generation
  estimatedCost Float?
  createdAt   DateTime @default(now())
}
```

---

## ✅ Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] Correct Google AI package installed (`@google/generative-ai`)
- [ ] MongoDB Atlas Vector Search enabled on cluster
- [ ] ImageKit API keys configured and tested
- [ ] HuggingFace API key obtained (or alternative embedding service selected)
- [ ] Rate limit model added to Prisma schema
- [ ] BullMQ replaced with Agenda.js (or alternative)
- [ ] Zod validation schemas created for all endpoints
- [ ] Error handling wrapper implemented for LangGraph nodes
- [ ] Retry logic utility created
- [ ] Auth middleware implemented
- [ ] Logger configured

---

*This review should be addressed before implementation begins to ensure a robust, error-free system.*
