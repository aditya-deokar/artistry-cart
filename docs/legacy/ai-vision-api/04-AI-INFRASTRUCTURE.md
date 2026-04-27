# AI Vision API - AI Infrastructure Setup

> **Document:** 04-AI-INFRASTRUCTURE.md  
> **Updated:** December 28, 2024 (Based on Official LangChain JS Docs)  
> **References:**  
> - [ChatGoogleGenerativeAI](https://docs.langchain.com/oss/javascript/integrations/chat/google_generative_ai)  
> - [LangGraph Overview](https://docs.langchain.com/oss/javascript/langgraph/overview)

---

## 📦 Dependencies (Official)

```bash
# LangChain + Google Generative AI (Official)
pnpm add @langchain/google-genai @langchain/core

# LangGraph (Official)
pnpm add @langchain/langgraph

# Native Gemini SDK (for image generation)
pnpm add @google/generative-ai

# Supporting libraries
pnpm add @huggingface/inference agenda sharp zod uuid winston jsonwebtoken
```

> **Note:** `@langchain/google-genai` wraps `@google/generative-ai` internally. Use LangChain for LLM operations, native SDK for image generation.

---

## ⚙️ Environment Variables

```env
# Google AI - Get from https://ai.google.dev/tutorials/setup
GOOGLE_API_KEY=your_gemini_api_key

# HuggingFace (for CLIP embeddings)
HUGGINGFACE_API_KEY=your_hf_key

# ImageKit (existing)
IMAGEKIT_PUBLIC_API_KEY=your_public_key
IMAGEKIT_PRIVATE_API_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/adityadeokar/

# MongoDB
DATABASE_URL=your_mongodb_url

# JWT
JWT_SECRET=your_jwt_secret
```

---

## 🔧 Gemini Configuration (Official Syntax)

```typescript
// src/config/gemini.ts
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// ============================================
// LANGCHAIN MODELS (for text operations)
// ============================================

// Available models: gemini-2.5-pro, gemini-2.5-flash, gemini-1.5-pro
export const MODELS = {
  PRO: 'gemini-2.5-pro',
  FLASH: 'gemini-2.5-flash',
  LEGACY: 'gemini-1.5-pro',
} as const;

// Base model factory
export function createGeminiModel(options?: {
  model?: string;
  temperature?: number;
  maxRetries?: number;
  maxOutputTokens?: number;
}) {
  return new ChatGoogleGenerativeAI({
    model: options?.model ?? MODELS.PRO,
    apiKey: process.env.GOOGLE_API_KEY,
    temperature: options?.temperature ?? 0.7,
    maxRetries: options?.maxRetries ?? 2,
    maxOutputTokens: options?.maxOutputTokens ?? 4096,
  });
}

// Pre-configured models for different tasks
export const analysisModel = createGeminiModel({ 
  model: MODELS.PRO,
  temperature: 0.3, 
});

export const creativeModel = createGeminiModel({ 
  model: MODELS.PRO,
  temperature: 0.9, 
});

export const productGenModel = createGeminiModel({ 
  model: MODELS.PRO,
  temperature: 0.5,
});

// ============================================
// NATIVE SDK (for image generation)
// ============================================

export const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// Get image-capable model
export function getImageModel() {
  return genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp', // Image generation model
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
  });
}
```

---

## 🖼️ Image Generation Service

```typescript
// src/services/generation/gemini-image.service.ts
import { getImageModel } from '@/config/gemini';
import { uploadConceptImage } from '@/services/common/imagekit.service';
import { withRetry } from '@/utils/helpers/retry';
import { logger } from '@/utils/helpers/logger';

export interface GeneratedImage {
  url: string;
  thumbnailUrl: string;
  fileId: string;
  filePath: string;
}

export interface GenerationResult {
  images: GeneratedImage[];
  failedCount: number;
  errors: string[];
}

export async function generateConceptImages(
  prompt: string,
  conceptId: string,
  count: number = 4
): Promise<GenerationResult> {
  const result: GenerationResult = {
    images: [],
    failedCount: 0,
    errors: [],
  };

  const model = getImageModel();

  for (let i = 0; i < count; i++) {
    try {
      const image = await withRetry(async () => {
        const response = await model.generateContent({
          contents: [{
            role: 'user',
            parts: [{ text: prompt }],
          }],
          generationConfig: {
            responseModalities: ['image', 'text'],
          },
        });

        const candidate = response.response.candidates?.[0];
        if (!candidate?.content?.parts) {
          throw new Error('No content in response');
        }

        for (const part of candidate.content.parts) {
          if (part.inlineData?.data) {
            return await uploadConceptImage(
              part.inlineData.data,
              part.inlineData.mimeType || 'image/png',
              conceptId,
              i
            );
          }
        }

        throw new Error('No image generated');
      }, { maxRetries: 2, delayMs: 2000 });

      result.images.push(image);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Image ${i + 1} failed`, { conceptId, error: errorMsg });
      result.failedCount++;
      result.errors.push(`Image ${i + 1}: ${errorMsg}`);
    }
  }

  return result;
}
```

---

## 🔄 LangGraph Workflow (Official Syntax)

Based on the official LangGraph JS documentation:

```typescript
// src/agents/concept-generator.agent.ts
import { StateGraph, START, END, Annotation } from '@langchain/langgraph';
import { analysisModel, creativeModel, productGenModel } from '@/config/gemini';
import { generateConceptImages } from '@/services/generation/gemini-image.service';
import { generateProductData, saveGeneratedProduct } from '@/services/generation/product-generator.service';
import { logger } from '@/utils/helpers/logger';

// ============================================
// STATE DEFINITION (Official Annotation syntax)
// ============================================

const ConceptStateAnnotation = Annotation.Root({
  // Input
  userPrompt: Annotation<string>(),
  mode: Annotation<'text' | 'variation' | 'visual'>(),
  conceptId: Annotation<string>(),
  sessionId: Annotation<string>(),
  
  // Processing
  analyzedIntent: Annotation<Record<string, any> | null>({
    default: () => null,
  }),
  enhancedPrompt: Annotation<string | null>({
    default: () => null,
  }),
  
  // Results
  generatedImages: Annotation<Array<{
    url: string;
    fileId: string;
    thumbnailUrl: string;
  }>>({
    default: () => [],
  }),
  imageErrors: Annotation<string[]>({
    default: () => [],
  }),
  generatedProduct: Annotation<Record<string, any> | null>({
    default: () => null,
  }),
  
  // Status
  error: Annotation<string | null>({
    default: () => null,
  }),
  status: Annotation<'processing' | 'partial_success' | 'success' | 'failed'>({
    default: () => 'processing',
  }),
});

type ConceptState = typeof ConceptStateAnnotation.State;

// ============================================
// NODE FUNCTIONS
// ============================================

async function analyzeIntent(state: ConceptState): Promise<Partial<ConceptState>> {
  try {
    logger.info('Analyzing intent', { conceptId: state.conceptId });
    
    const response = await analysisModel.invoke([
      ['system', `You are a product analyst. Analyze the request and extract:
        - category, subcategory
        - style keywords
        - materials mentioned
        - color preferences
        - size/dimension hints
        Return JSON only.`],
      ['human', state.userPrompt],
    ]);

    const content = response.content as string;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    return {
      analyzedIntent: jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: content },
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Analysis failed';
    logger.error('Analyze failed', { conceptId: state.conceptId, error: errorMsg });
    return { error: errorMsg, status: 'failed' };
  }
}

async function enhancePrompt(state: ConceptState): Promise<Partial<ConceptState>> {
  if (state.error) return {};
  
  try {
    logger.info('Enhancing prompt', { conceptId: state.conceptId });
    
    const response = await creativeModel.invoke([
      ['system', `Create a detailed image prompt for product photography.
        Include: lighting, materials, textures, angles.
        Keep under 200 words. No explanation, just the prompt.`],
      ['human', `Original: ${state.userPrompt}\nAnalysis: ${JSON.stringify(state.analyzedIntent)}`],
    ]);
    
    return {
      enhancedPrompt: response.content as string,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Enhancement failed';
    logger.error('Enhance failed', { conceptId: state.conceptId, error: errorMsg });
    return { error: errorMsg, status: 'failed' };
  }
}

async function generateImages(state: ConceptState): Promise<Partial<ConceptState>> {
  if (state.error || !state.enhancedPrompt) return {};
  
  try {
    logger.info('Generating images', { conceptId: state.conceptId });
    
    const result = await generateConceptImages(
      state.enhancedPrompt,
      state.conceptId,
      4
    );
    
    const status = result.images.length > 0
      ? (result.failedCount > 0 ? 'partial_success' : 'success')
      : 'failed';
    
    return {
      generatedImages: result.images,
      imageErrors: result.errors,
      status,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Generation failed';
    logger.error('Generate failed', { conceptId: state.conceptId, error: errorMsg });
    return { error: errorMsg, status: 'failed' };
  }
}

async function generateProduct(state: ConceptState): Promise<Partial<ConceptState>> {
  // Skip if no images
  if (state.generatedImages.length === 0) {
    return { status: 'failed' };
  }
  
  try {
    logger.info('Generating product data', { conceptId: state.conceptId });
    
    const productResult = await generateProductData(
      state.conceptId,
      state.userPrompt,
      state.analyzedIntent!
    );
    
    if (productResult.data) {
      const saved = await saveGeneratedProduct(
        state.conceptId,
        productResult.data,
        state.enhancedPrompt!
      );
      return { generatedProduct: saved };
    }
    
    logger.warn('Product gen returned no data', { conceptId: state.conceptId });
    return {};
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Product gen failed';
    logger.error('ProductGen failed', { conceptId: state.conceptId, error: errorMsg });
    // Don't fail the whole workflow for product gen errors
    return {};
  }
}

// ============================================
// ROUTING LOGIC
// ============================================

function routeAfterImages(state: ConceptState): 'productGen' | typeof END {
  if (state.error || state.generatedImages.length === 0) {
    return END;
  }
  return 'productGen';
}

// ============================================
// BUILD GRAPH (Official StateGraph syntax)
// ============================================

const workflow = new StateGraph(ConceptStateAnnotation)
  .addNode('analyze', analyzeIntent)
  .addNode('enhance', enhancePrompt)
  .addNode('generate', generateImages)
  .addNode('productGen', generateProduct)
  // Edges
  .addEdge(START, 'analyze')
  .addEdge('analyze', 'enhance')
  .addEdge('enhance', 'generate')
  .addConditionalEdges('generate', routeAfterImages)
  .addEdge('productGen', END);

// Compile the graph
export const conceptGeneratorGraph = workflow.compile();

// Types for external use
export type { ConceptState };
```

---

## 🛠️ LangChain Tool Calling (Optional)

For advanced use cases with tool calling:

```typescript
// src/agents/tools/database-tools.ts
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { prisma } from '@/config/database';

// Search products tool
export const searchProductsTool = tool(
  async ({ query, category, limit }) => {
    const products = await prisma.products.findMany({
      where: {
        isDeleted: false,
        status: 'Active',
        ...(category && { categoryId: category }),
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      select: {
        id: true,
        title: true,
        price: true,
        images: true,
      },
    });
    return JSON.stringify(products);
  },
  {
    name: 'search_products',
    description: 'Search for existing products in the database',
    schema: z.object({
      query: z.string().describe('Search query'),
      category: z.string().optional().describe('Category ID to filter by'),
      limit: z.number().default(10).describe('Max results'),
    }),
  }
);

// Get categories tool
export const getCategoriesool = tool(
  async () => {
    const config = await prisma.site_config.findFirst();
    return JSON.stringify(config?.categories || []);
  },
  {
    name: 'get_categories',
    description: 'Get available product categories',
    schema: z.object({}),
  }
);

// Using tools with the model
export function createModelWithTools() {
  return analysisModel.bindTools([
    searchProductsTool,
    getCategoriesool,
  ]);
}
```

---

## 📊 Rate Limiting (MongoDB)

```typescript
// src/middleware/rate-limit.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { prisma } from '@/config/database';

const LIMITS: Record<string, { limit: number; windowMs: number }> = {
  '/generate': { limit: 10, windowMs: 60000 },
  '/search': { limit: 30, windowMs: 60000 },
  default: { limit: 100, windowMs: 60000 },
};

export async function rateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = (req as any).user?.id || 'anon';
  const path = '/' + (req.path.split('/')[1] || 'default');
  const config = LIMITS[path] || LIMITS.default;
  const key = `${userId}:${path}`;
  const windowStart = new Date(Date.now() - config.windowMs);

  try {
    const entry = await prisma.rateLimitEntry.upsert({
      where: { key },
      update: { count: { increment: 1 } },
      create: { key, count: 1, windowStart: new Date() },
    });

    if (entry.windowStart < windowStart) {
      await prisma.rateLimitEntry.update({
        where: { key },
        data: { count: 1, windowStart: new Date() },
      });
      entry.count = 1;
    }

    res.setHeader('X-RateLimit-Remaining', Math.max(0, config.limit - entry.count));

    if (entry.count > config.limit) {
      return res.status(429).json({
        success: false,
        error: { code: 'RATE_LIMITED', message: 'Too many requests' },
      });
    }

    next();
  } catch {
    next(); // Fail open
  }
}
```

---

## 🏭 Product Generation Service

```typescript
// src/services/generation/product-generator.service.ts
import { productGenModel } from '@/config/gemini';
import { prisma } from '@/config/database';
import { GeneratedProductSchema, safeParseLLMResponse, type GeneratedProductData } from '@/validators/llm-schemas';
import { withRetry } from '@/utils/helpers/retry';
import { logger } from '@/utils/helpers/logger';

export async function generateProductData(
  conceptId: string,
  userPrompt: string,
  analyzedFeatures: Record<string, any>
): Promise<{ data: GeneratedProductData | null; error?: string }> {
  const siteConfig = await prisma.site_config.findFirst();
  const categories = siteConfig?.categories || [];
  const subCategories = siteConfig?.subCategories || {};

  try {
    const response = await withRetry(() => productGenModel.invoke([
      ['system', `You are a product analyst for Artistry Cart marketplace.
Generate structured product data as JSON with:
- title, description, detailedDescription
- category (from: ${JSON.stringify(categories)})
- subCategory, tags, colors, sizes, materials
- estimatedPriceMin, estimatedPriceMax (INR), priceConfidence (0-1)
- requiredSkills, estimatedDuration, complexityLevel
- feasibilityScore (0-100), feasibilityNotes
Return valid JSON only.`],
      ['human', `Request: ${userPrompt}\nAnalysis: ${JSON.stringify(analyzedFeatures)}`],
    ]), { maxRetries: 2 });

    const parseResult = await safeParseLLMResponse(
      response.content as string,
      GeneratedProductSchema
    );

    if (!parseResult.success) {
      return { data: null, error: parseResult.error };
    }

    return { data: parseResult.data };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown';
    logger.error('Product generation failed', { conceptId, error: errorMsg });
    return { data: null, error: errorMsg };
  }
}

export async function saveGeneratedProduct(
  conceptId: string,
  productData: GeneratedProductData,
  promptUsed: string
) {
  return prisma.aIGeneratedProduct.create({
    data: {
      conceptId,
      ...productData,
      llmModel: 'gemini-2.5-pro',
      promptUsed,
      generationVersion: 1,
      isValidated: true,
      validationErrors: [],
    },
  });
}
```

---

## 📝 Zod Validation Schemas

```typescript
// src/validators/llm-schemas.ts
import { z } from 'zod';

export const GeneratedProductSchema = z.object({
  title: z.string().min(5).max(80),
  description: z.string().min(50).max(300),
  detailedDescription: z.string().min(200).max(1000),
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
  requiredSkills: z.array(z.string()).min(1),
  estimatedDuration: z.string(),
  complexityLevel: z.enum(['simple', 'moderate', 'complex', 'expert']),
  styleKeywords: z.array(z.string()),
  designNotes: z.string().optional(),
  feasibilityScore: z.number().min(0).max(100),
  feasibilityNotes: z.string().optional(),
});

export type GeneratedProductData = z.infer<typeof GeneratedProductSchema>;

export async function safeParseLLMResponse<T>(
  content: string,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                    content.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) {
    return { success: false, error: 'No JSON in response' };
  }

  try {
    const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    return { success: true, data: schema.parse(parsed) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map(e => e.message).join(', ') };
    }
    return { success: false, error: 'Invalid JSON' };
  }
}
```

---

## 🔄 Retry Utility

```typescript
// src/utils/helpers/retry.ts
import { logger } from './logger';

export interface RetryOptions {
  maxRetries: number;
  delayMs: number;
  backoffMultiplier: number;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const { maxRetries = 3, delayMs = 1000, backoffMultiplier = 2 } = options;
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxRetries) throw lastError;
      
      const delay = delayMs * Math.pow(backoffMultiplier, attempt);
      logger.warn(`Retry ${attempt + 1}/${maxRetries} in ${delay}ms`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  
  throw lastError;
}
```

---

## 📝 Logger

```typescript
// src/utils/helpers/logger.ts
import { createLogger, format, transports } from 'winston';

export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    process.env.NODE_ENV === 'production' ? format.json() : format.simple()
  ),
  defaultMeta: { service: 'ai-vision' },
  transports: [new transports.Console()],
});
```

---

*Previous: [03-API-ENDPOINTS.md](./03-API-ENDPOINTS.md) | Next: [05-IMPLEMENTATION-PHASES.md](./05-IMPLEMENTATION-PHASES.md)*
