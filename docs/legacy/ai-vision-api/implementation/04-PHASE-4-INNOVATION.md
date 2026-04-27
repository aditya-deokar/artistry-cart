# Phase 4: Innovation & Scale - Implementation Guide

**Duration:** 12 weeks (Q4 2026)  
**Team:** 5 Backend, 3 Frontend, 1 ML Engineer, 1 DevOps, 1 QA  
**Goal:** Push boundaries with cutting-edge features and prepare for scale

---

## 📋 Overview

Phase 4 is about differentiation and preparing for explosive growth. We'll add AR preview, video generation, sustainability scoring, white-label API, and enterprise features while ensuring the infrastructure can handle 10x traffic.

---

## 🎯 Features & Timeline

### Week 1-3: AR Preview Integration

**Goal:** Let buyers visualize products in their space using AR

#### Frontend & Backend Implementation

**1. AR Service (Week 1)**

```typescript
// apps/aivision-service/src/services/ar-preview.service.ts

import { Client as Mediapipe } from '@mediapipe/tasks-vision';
import { Canvas, createCanvas, Image } from 'canvas';

export interface ARPreviewRequest {
  conceptId: string;
  sceneImage: string; // Base64 or URL
  sceneType: 'room' | 'person' | 'surface';
  placement?: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  };
}

export class ARPreviewService {
  private depthEstimator: any;
  private objectDetector: any;

  async initialize() {
    // Initialize ML models for depth estimation and object detection
    this.depthEstimator = await this.loadDepthModel();
    this.objectDetector = await this.loadObjectDetector();
  }

  async generateARPreview(request: ARPreviewRequest) {
    // 1. Fetch concept details
    const concept = await prisma.concept.findUnique({
      where: { id: request.conceptId },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        generatedProduct: true,
      },
    });

    if (!concept || !concept.images.length) {
      throw new Error('Concept or image not found');
    }

    // 2. Load scene and product images
    const sceneImage = await this.loadImage(request.sceneImage);
    const productImage = await this.loadImage(concept.images[0].url);

    // 3. Analyze scene
    const sceneAnalysis = await this.analyzeScene(sceneImage, request.sceneType);

    // 4. Determine optimal placement if not provided
    const placement = request.placement || await this.suggestPlacement(
      sceneAnalysis,
      concept.generatedProduct
    );

    // 5. Generate AR composite
    const arImage = await this.compositeARImage(
      sceneImage,
      productImage,
      placement,
      sceneAnalysis
    );

    // 6. Save AR preview
    const arPreview = await prisma.aRPreview.create({
      data: {
        conceptId: request.conceptId,
        sceneType: request.sceneType,
        placement: placement as any,
        imageUrl: await this.uploadARImage(arImage),
        metadata: {
          sceneAnalysis,
          productDimensions: concept.generatedProduct?.dimensions,
        } as any,
      },
    });

    return {
      arPreviewId: arPreview.id,
      imageUrl: arPreview.imageUrl,
      placement,
      suggestions: this.generatePlacementSuggestions(sceneAnalysis),
    };
  }

  private async analyzeScene(image: any, sceneType: string) {
    // Detect surfaces, estimate depth, identify objects
    const [surfaces, depthMap, objects] = await Promise.all([
      this.detectSurfaces(image),
      this.estimateDepth(image),
      this.detectObjects(image),
    ]);

    return {
      surfaces,
      depthMap,
      objects,
      lighting: await this.estimateLighting(image),
      dimensions: { width: image.width, height: image.height },
    };
  }

  private async suggestPlacement(sceneAnalysis: any, productData: any) {
    // Use heuristics to suggest best placement
    const surfaces = sceneAnalysis.surfaces.filter((s: any) => 
      s.type === 'horizontal' && s.area > 1000
    );

    if (!surfaces.length) {
      // Default center placement
      return {
        x: sceneAnalysis.dimensions.width / 2,
        y: sceneAnalysis.dimensions.height / 2,
        scale: 0.3,
        rotation: 0,
      };
    }

    // Place on largest surface
    const bestSurface = surfaces.sort((a: any, b: any) => b.area - a.area)[0];
    
    return {
      x: bestSurface.center.x,
      y: bestSurface.center.y,
      scale: this.calculateOptimalScale(bestSurface, productData),
      rotation: 0,
    };
  }

  private async compositeARImage(
    sceneImage: any,
    productImage: any,
    placement: any,
    sceneAnalysis: any
  ) {
    const canvas = createCanvas(sceneImage.width, sceneImage.height);
    const ctx = canvas.getContext('2d');

    // Draw scene
    ctx.drawImage(sceneImage, 0, 0);

    // Apply perspective transformation to product
    const transformedProduct = await this.applyPerspective(
      productImage,
      placement,
      sceneAnalysis.depthMap
    );

    // Apply lighting adjustments
    const litProduct = await this.adjustLighting(
      transformedProduct,
      sceneAnalysis.lighting
    );

    // Composite product onto scene
    ctx.globalAlpha = 0.95;
    ctx.drawImage(litProduct, placement.x, placement.y);

    // Add shadow
    await this.addRealisticShadow(ctx, placement, sceneAnalysis);

    return canvas.toBuffer('image/png');
  }
}
```

**Database Schema:**

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

---

### Week 4-6: AI Video Generation

**Goal:** Generate 15-second product videos from concepts

#### Backend Implementation

**1. Video Generation Service (Week 4-5)**

```typescript
// apps/aivision-service/src/services/video-generation.service.ts

import Replicate from 'replicate';

export interface VideoGenerationRequest {
  conceptId: string;
  style: 'showcase' | 'lifestyle' | 'process' | '360spin';
  duration: 10 | 15 | 30; // seconds
  music?: boolean;
  voiceover?: string;
}

export class VideoGenerationService {
  private replicate: Replicate;
  private videoQueue: Queue;

  constructor() {
    this.replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
    
    this.videoQueue = new Queue('video-generation', {
      connection: redisConnection,
    });

    this.setupWorker();
  }

  async generateVideo(request: VideoGenerationRequest) {
    // 1. Fetch concept and images
    const concept = await prisma.concept.findUnique({
      where: { id: request.conceptId },
      include: {
        images: true,
        generatedProduct: true,
      },
    });

    if (!concept) {
      throw new Error('Concept not found');
    }

    // 2. Create video generation job
    const job = await prisma.videoGenerationJob.create({
      data: {
        conceptId: request.conceptId,
        style: request.style,
        duration: request.duration,
        status: 'queued',
        progress: 0,
      },
    });

    // 3. Queue video generation
    await this.videoQueue.add('generate', {
      jobId: job.id,
      conceptId: request.conceptId,
      images: concept.images.map(img => img.url),
      productData: concept.generatedProduct,
      style: request.style,
      duration: request.duration,
      music: request.music,
      voiceover: request.voiceover,
    });

    return {
      jobId: job.id,
      status: 'queued',
      estimatedTime: 120, // 2 minutes
    };
  }

  private setupWorker() {
    this.videoQueue.process('generate', async (job) => {
      const { jobId, images, productData, style, duration } = job.data;

      try {
        // Update status
        await this.updateJobStatus(jobId, 'processing', 10);

        // 1. Generate video frames using Stable Video Diffusion
        const frames = await this.generateFrames(images, style, duration);
        await this.updateJobStatus(jobId, 'processing', 40);

        // 2. Add transitions and effects
        const editedFrames = await this.applyTransitions(frames, style);
        await this.updateJobStatus(jobId, 'processing', 60);

        // 3. Add text overlays (product name, price, etc.)
        const overlaidFrames = await this.addTextOverlays(
          editedFrames,
          productData
        );
        await this.updateJobStatus(jobId, 'processing', 75);

        // 4. Add background music if requested
        let audioTrack;
        if (job.data.music) {
          audioTrack = await this.selectBackgroundMusic(style);
        }
        await this.updateJobStatus(jobId, 'processing', 85);

        // 5. Render final video
        const videoBuffer = await this.renderVideo(
          overlaidFrames,
          audioTrack,
          duration
        );
        await this.updateJobStatus(jobId, 'processing', 95);

        // 6. Upload to storage
        const videoUrl = await this.uploadVideo(videoBuffer, jobId);
        await this.updateJobStatus(jobId, 'completed', 100, videoUrl);

        return { videoUrl };
      } catch (error) {
        await this.updateJobStatus(jobId, 'failed', 0);
        throw error;
      }
    });
  }

  private async generateFrames(images: string[], style: string, duration: number) {
    const framesNeeded = duration * 30; // 30 fps
    
    if (style === '360spin') {
      return this.generate360Frames(images[0], framesNeeded);
    }

    // Use Stable Video Diffusion for other styles
    const output = await this.replicate.run(
      'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
      {
        input: {
          cond_aug: 0.02,
          decoding_t: 7,
          input_image: images[0],
          video_length: 'auto',
          sizing_strategy: 'maintain_aspect_ratio',
          motion_bucket_id: style === 'showcase' ? 127 : 180,
          frames_per_second: 30,
        },
      }
    );

    return output;
  }

  private async addTextOverlays(frames: any[], productData: any) {
    // Use Canvas to add text overlays
    const overlaidFrames = [];

    for (let i = 0; i < frames.length; i++) {
      const canvas = createCanvas(1920, 1080);
      const ctx = canvas.getContext('2d');

      // Draw frame
      const img = await loadImage(frames[i]);
      ctx.drawImage(img, 0, 0, 1920, 1080);

      // Add product name (first 3 seconds)
      if (i < 90) {
        ctx.font = 'bold 60px Arial';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        const text = productData.title || 'Handcrafted Product';
        ctx.strokeText(text, 100, 150);
        ctx.fillText(text, 100, 150);
      }

      // Add price (last 2 seconds)
      if (i > frames.length - 60) {
        ctx.font = 'bold 48px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        const price = `₹${productData.estimatedPriceMin || 'N/A'}`;
        ctx.strokeText(price, 100, 950);
        ctx.fillText(price, 100, 950);
      }

      overlaidFrames.push(canvas.toBuffer());
    }

    return overlaidFrames;
  }
}
```

---

### Week 7-9: Sustainability Scoring

**Goal:** Calculate and display environmental impact scores

#### Implementation

**1. Sustainability Calculator (Week 7)**

```typescript
// apps/aivision-service/src/services/sustainability.service.ts

export interface SustainabilityScore {
  overall: number; // 0-100
  breakdown: {
    materials: number;
    production: number;
    packaging: number;
    shipping: number;
  };
  certifications: string[];
  carbonFootprint: number; // kg CO2e
  recommendations: string[];
}

export class SustainabilityService {
  async calculateScore(conceptId: string): Promise<SustainabilityScore> {
    const concept = await prisma.concept.findUnique({
      where: { id: conceptId },
      include: {
        generatedProduct: true,
        artisanMatches: {
          include: {
            seller: {
              include: {
                shops: true,
              },
            },
          },
        },
      },
    });

    if (!concept) {
      throw new Error('Concept not found');
    }

    const productData = concept.generatedProduct;
    const artisan = concept.artisanMatches[0]?.seller;

    // Calculate component scores
    const materialScore = await this.scoreMaterials(productData?.materials || []);
    const productionScore = await this.scoreProduction(artisan);
    const packagingScore = await this.scorePackaging(artisan);
    const shippingScore = await this.scoreShipping(artisan?.shops?.[0]?.city);

    // Calculate carbon footprint
    const carbonFootprint = await this.calculateCarbonFootprint({
      materials: productData?.materials,
      productionMethod: 'handmade',
      weight: productData?.weight,
      shippingDistance: await this.getShippingDistance(artisan?.shops?.[0]?.city),
    });

    // Overall score (weighted average)
    const overall = Math.round(
      materialScore * 0.4 +
      productionScore * 0.3 +
      packagingScore * 0.15 +
      shippingScore * 0.15
    );

    // Generate certifications
    const certifications = this.detectCertifications(artisan);

    // Generate recommendations
    const recommendations = this.generateRecommendations({
      materialScore,
      productionScore,
      packagingScore,
      shippingScore,
    });

    const score: SustainabilityScore = {
      overall,
      breakdown: {
        materials: materialScore,
        production: productionScore,
        packaging: packagingScore,
        shipping: shippingScore,
      },
      certifications,
      carbonFootprint,
      recommendations,
    };

    // Save to database
    await prisma.sustainabilityScore.upsert({
      where: { conceptId },
      create: {
        conceptId,
        scoreData: score as any,
      },
      update: {
        scoreData: score as any,
        updatedAt: new Date(),
      },
    });

    return score;
  }

  private async scoreMaterials(materials: string[]): Promise<number> {
    const sustainabilityScores: Record<string, number> = {
      // Natural, renewable
      'cotton': 85,
      'bamboo': 95,
      'jute': 90,
      'wool': 80,
      
      // Recycled
      'recycled-plastic': 75,
      'recycled-metal': 80,
      
      // Traditional
      'clay': 90,
      'wood': 75,
      'stone': 85,
      
      // Less sustainable
      'plastic': 30,
      'synthetic-fabric': 40,
      'leather': 50,
    };

    if (!materials.length) return 50; // Default mid-score

    const scores = materials.map(m => 
      sustainabilityScores[m.toLowerCase()] || 50
    );

    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  private async scoreProduction(artisan: any): Promise<number> {
    let score = 70; // Base score for handmade

    // Bonus for local artisan
    if (artisan?.shops?.[0]?.city) {
      score += 10;
    }

    // Bonus for traditional methods
    if (artisan?.specialization?.includes('traditional')) {
      score += 10;
    }

    // Bonus for certifications
    if (artisan?.certifications?.includes('fair-trade')) {
      score += 10;
    }

    return Math.min(score, 100);
  }

  private async calculateCarbonFootprint(params: any): Promise<number> {
    // Simplified carbon calculation
    let carbon = 0;

    // Materials carbon (kg CO2e per kg)
    const materialCarbon: Record<string, number> = {
      cotton: 5.3,
      plastic: 6.0,
      wood: 0.8,
      metal: 3.5,
    };

    // Production carbon (handmade is low)
    carbon += 0.5; // kg CO2e for handmade production

    // Shipping carbon (0.2 kg CO2e per km)
    carbon += (params.shippingDistance || 500) * 0.2 / 1000;

    return Math.round(carbon * 10) / 10;
  }
}
```

---

### Week 10-12: White-Label API & Enterprise

**Goal:** Enable other platforms to integrate AI Vision

#### Implementation

**1. White-Label API (Week 10-11)**

```typescript
// apps/api-gateway/src/routes/white-label.routes.ts

import { Router } from 'express';
import { apiKeyAuth, rateLimitByTier } from '../middleware';

const router = Router();

// Apply API key authentication
router.use(apiKeyAuth);

/**
 * @route POST /api/v2/wl/concepts/create
 * @desc Create AI concept (white-label)
 * @access API Key required
 */
router.post(
  '/concepts/create',
  rateLimitByTier,
  async (req, res) => {
    const { clientId } = req.apiKey;
    const { referenceImages, textPrompt, options } = req.body;

    // Create concept under client's namespace
    const concept = await aiVisionClient.createConcept({
      referenceImages,
      textPrompt,
      clientId,
      branding: options?.branding, // Custom branding
      webhookUrl: options?.webhookUrl, // Status callbacks
    });

    res.json({
      success: true,
      conceptId: concept.id,
      status: concept.status,
      estimatedCompletion: 20, // seconds
    });
  }
);

/**
 * @route GET /api/v2/wl/concepts/:id
 * @desc Get concept details
 * @access API Key required
 */
router.get(
  '/concepts/:id',
  async (req, res) => {
    const { clientId } = req.apiKey;
    const { id } = req.params;

    // Verify concept belongs to client
    const concept = await prisma.concept.findFirst({
      where: {
        id,
        clientId,
      },
      include: {
        images: true,
        generatedProduct: true,
      },
    });

    if (!concept) {
      return res.status(404).json({ error: 'Concept not found' });
    }

    res.json({
      success: true,
      concept: formatConceptForAPI(concept),
    });
  }
);

/**
 * @route POST /api/v2/wl/search
 * @desc Visual search (white-label)
 * @access API Key required
 */
router.post(
  '/search',
  rateLimitByTier,
  async (req, res) => {
    const { clientId } = req.apiKey;
    const { queryImage, queryText, filters } = req.body;

    const results = await aiVisionClient.hybridSearch({
      queryImage,
      queryText,
      clientId, // Scope to client's products
      filters,
      limit: 20,
    });

    res.json({
      success: true,
      results: results.map(formatProductForAPI),
      total: results.length,
    });
  }
);

export default router;
```

**API Key Management:**

```typescript
// packages/middleware/api-key-auth.ts

export async function apiKeyAuth(req: any, res: any, next: any) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  const keyData = await prisma.aPIKey.findUnique({
    where: { key: apiKey },
    include: { client: true },
  });

  if (!keyData || !keyData.isActive) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  // Check rate limits based on tier
  const rateLimit = await checkRateLimit(keyData.clientId, keyData.tier);
  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      resetAt: rateLimit.resetAt,
    });
  }

  // Attach to request
  req.apiKey = keyData;
  next();
}
```

---

## 🧪 Testing Checklist

### Week 3: AR Preview
- [ ] AR placement accurate
- [ ] Realistic lighting/shadows
- [ ] Multiple scene types work
- [ ] Mobile performance acceptable
- [ ] Load test: 100 concurrent generations

### Week 6: Video Generation
- [ ] Videos generate successfully
- [ ] Quality HD (1080p)
- [ ] Queue handles 50+ jobs
- [ ] All styles work
- [ ] Avg generation time < 3min

### Week 9: Sustainability
- [ ] Scores calculated correctly
- [ ] Carbon footprint realistic
- [ ] Certifications detected
- [ ] Recommendations helpful

### Week 12: White-Label API
- [ ] API key auth works
- [ ] Rate limiting enforced
- [ ] Webhooks deliver reliably
- [ ] Documentation complete
- [ ] SDKs published (Node, Python)

---

## 📊 Success Metrics (End of Phase 4)

| Metric | Target | Measurement |
|--------|--------|-------------|
| AR usage | > 30% | Concepts with AR |
| Video views | > 50% | Videos viewed / Generated |
| Sustainability awareness | > 70% | Users viewing scores |
| API adoption | 10+ clients | Active API keys |
| Revenue from API | $50K/mo | Subscription revenue |

---

## 🚀 Launch Readiness

**Infrastructure:**
- [ ] Load balancers configured
- [ ] Auto-scaling enabled
- [ ] CDN for all assets
- [ ] Database replication
- [ ] Redis cluster
- [ ] Kafka cluster
- [ ] Monitoring dashboards
- [ ] Alert rules configured

**Documentation:**
- [ ] API documentation published
- [ ] SDK documentation
- [ ] Integration guides
- [ ] Migration guides
- [ ] Troubleshooting docs

**Support:**
- [ ] Support ticketing system
- [ ] Knowledge base
- [ ] Community forum
- [ ] 24/7 on-call rotation

---

*Phase 4 complete - System ready for scale and innovation!*
