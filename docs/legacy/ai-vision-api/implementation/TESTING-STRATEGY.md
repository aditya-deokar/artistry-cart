# Testing Strategy - AI Vision Service

Comprehensive testing approach for all phases of implementation.

---

## Testing Pyramid

```
           E2E (5%)
        Integration (15%)
      Unit Tests (80%)
```

**Philosophy:** Majority unit tests for speed, integration tests for API contracts, minimal E2E for critical paths.

---

## Phase 1: Foundation Testing

### 1.1 Real-Time Progress

**Unit Tests:**
```typescript
// apps/aivision-service/src/__tests__/services/progress.service.test.ts

describe('ProgressEmitter', () => {
  let emitter: ProgressEmitter;
  let mockWs: jest.Mocked<WebSocket.Server>;

  beforeEach(() => {
    mockWs = createMockWebSocketServer();
    emitter = new ProgressEmitter(mockWs);
  });

  it('should emit progress with correct format', async () => {
    const sessionId = 'test-session-123';
    
    await emitter.emit(sessionId, {
      stage: 'ANALYZING',
      progress: 50,
      message: 'Analyzing images...',
    });

    expect(mockWs.to).toHaveBeenCalledWith(`session:${sessionId}`);
    expect(mockWs.emit).toHaveBeenCalledWith('progress', {
      stage: 'ANALYZING',
      progress: 50,
      message: 'Analyzing images...',
      timestamp: expect.any(Date),
    });
  });

  it('should save progress to database', async () => {
    const sessionId = 'test-session-123';
    
    await emitter.emit(sessionId, {
      stage: 'GENERATING',
      progress: 75,
      message: 'Generating concept...',
    });

    const saved = await prisma.progressEvent.findFirst({
      where: { sessionId },
      orderBy: { timestamp: 'desc' },
    });

    expect(saved).toBeDefined();
    expect(saved.stage).toBe('GENERATING');
    expect(saved.progress).toBe(75);
  });
});
```

**Integration Tests:**
```typescript
// apps/aivision-service/src/__tests__/integration/websocket.test.ts

describe('WebSocket Progress Integration', () => {
  let server: Server;
  let client: WebSocket;

  beforeAll(async () => {
    server = await startTestServer();
  });

  afterAll(async () => {
    await server.close();
  });

  it('should receive real-time progress updates', (done) => {
    const sessionId = 'test-session-456';
    client = new WebSocket(`ws://localhost:${server.port}`);

    client.on('open', () => {
      // Join session room
      client.send(JSON.stringify({ event: 'join', sessionId }));
    });

    const progressEvents: any[] = [];
    client.on('message', (data) => {
      const message = JSON.parse(data.toString());
      
      if (message.event === 'progress') {
        progressEvents.push(message.data);
        
        if (progressEvents.length === 5) {
          // Expect all 5 stages
          expect(progressEvents.map(e => e.stage)).toEqual([
            'UPLOADING',
            'ANALYZING',
            'GENERATING',
            'MATCHING',
            'COMPLETED',
          ]);
          done();
        }
      }
    });

    // Trigger concept creation
    createConcept({ sessionId });
  });
});
```

### 1.2 Concept Refinement

**Unit Tests:**
```typescript
// apps/aivision-service/src/__tests__/services/refinement.service.test.ts

describe('ConceptRefinementService', () => {
  it('should analyze user feedback with LangGraph', async () => {
    const feedback = "Can you make it more colorful?";
    
    const result = await refinementService.analyzeFeedback(feedback);

    expect(result.refinementType).toBe('COLOR');
    expect(result.suggestedChanges).toHaveProperty('colorPalette');
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it('should handle multi-turn refinement', async () => {
    const conceptId = 'concept-123';
    
    // First refinement
    await refinementService.refine(conceptId, {
      feedback: "Make it bigger",
      refinementType: 'SIZE',
    });

    // Second refinement
    await refinementService.refine(conceptId, {
      feedback: "Add floral patterns",
      refinementType: 'DETAIL',
    });

    const concept = await prisma.concept.findUnique({
      where: { id: conceptId },
      include: { refinements: true },
    });

    expect(concept.refinements).toHaveLength(2);
    expect(concept.refinementCount).toBe(2);
  });
});
```

### 1.3 Artisan Quotes

**Integration Tests:**
```typescript
// apps/aivision-service/src/__tests__/integration/quotes.test.ts

describe('Artisan Quote System', () => {
  it('should send quote requests to matched artisans', async () => {
    const conceptId = 'concept-456';
    
    // Create quote request
    const quoteRequest = await quoteService.requestQuotes({
      conceptId,
      userId: 'user-123',
      requestedSellers: ['seller-1', 'seller-2'],
    });

    expect(quoteRequest.status).toBe('PENDING');

    // Verify notifications sent
    const notifications = await getNotifications(['seller-1', 'seller-2']);
    expect(notifications).toHaveLength(2);
  });

  it('should handle artisan quote submissions', async () => {
    const quoteRequestId = 'request-789';
    
    const quote = await quoteService.submitQuote({
      quoteRequestId,
      sellerId: 'seller-1',
      pricing: {
        basePrice: 5000,
        customization: 1000,
        materials: 2000,
        shipping: 500,
      },
      totalPrice: 8500,
      estimatedDays: 14,
    });

    expect(quote.status).toBe('PENDING');
    expect(quote.totalPrice).toBe(8500);

    // Verify buyer notification
    const buyerNotification = await getLastNotification('user-123');
    expect(buyerNotification.type).toBe('QUOTE_RECEIVED');
  });
});
```

---

## Phase 2: Engagement Testing

### 2.1 Concept Sharing

**E2E Tests:**
```typescript
// apps/aivision-service/src/__tests__/e2e/sharing.test.ts

describe('Concept Sharing E2E', () => {
  it('should complete full sharing flow', async () => {
    // 1. User creates concept
    const concept = await createTestConcept();

    // 2. User creates share link
    const { shareLink, shareToken } = await request(app)
      .post('/api/v1/ai/share/create')
      .send({
        conceptId: concept.id,
        options: {
          allowComments: true,
          allowVoting: true,
          isPublic: true,
        },
      })
      .expect(200)
      .then(res => res.body);

    expect(shareLink).toContain(shareToken);

    // 3. Recipient views shared concept
    const sharedView = await request(app)
      .get(`/api/v1/ai/share/${shareToken}`)
      .expect(200)
      .then(res => res.body);

    expect(sharedView.concept.id).toBe(concept.id);
    expect(sharedView.canComment).toBe(true);

    // 4. Recipient adds comment
    await request(app)
      .post(`/api/v1/ai/share/${shareToken}/comment`)
      .send({
        userId: 'recipient-123',
        comment: 'This looks amazing!',
      })
      .expect(200);

    // 5. Verify comment visible
    const updated = await request(app)
      .get(`/api/v1/ai/share/${shareToken}`)
      .expect(200)
      .then(res => res.body);

    expect(updated.comments).toHaveLength(1);
    expect(updated.comments[0].comment).toBe('This looks amazing!');
  });
});
```

### 2.2 Comparison Engine

**Unit Tests:**
```typescript
// apps/aivision-service/src/__tests__/services/comparison.service.test.ts

describe('ComparisonService', () => {
  it('should compare multiple concepts', async () => {
    const result = await comparisonService.createComparison({
      userId: 'user-123',
      sessionToken: 'session-456',
      items: [
        { type: 'concept', id: 'concept-1' },
        { type: 'concept', id: 'concept-2' },
        { type: 'product', id: 'product-1' },
      ],
    });

    expect(result.items).toHaveLength(3);
    expect(result.attributes).toBeDefined();
    expect(result.winners).toBeDefined();
  });

  it('should determine winners correctly', async () => {
    const items = [
      { id: '1', price: 5000 },
      { id: '2', price: 3000 },
      { id: '3', price: 4000 },
    ];

    const winners = determineWinners(items, [
      { key: 'price', type: 'range', values: items },
    ]);

    expect(winners.price).toEqual(['2']); // Lowest price
  });
});
```

---

## Phase 3: Intelligence Testing

### 3.1 AI Chat

**Unit Tests:**
```typescript
// apps/aivision-service/src/__tests__/services/chat.service.test.ts

describe('AIChatService', () => {
  it('should understand user intent', async () => {
    const result = await chatService.understandIntent({
      messages: [new HumanMessage('Show me blue ceramic vases')],
      context: {},
    });

    expect(result.context.intent).toBe('SEARCH');
    expect(result.context.entities).toMatchObject({
      color: 'blue',
      material: 'ceramic',
      category: 'vases',
    });
  });

  it('should maintain conversation context', async () => {
    const conversationId = 'conv-123';

    // First message
    await chatService.chat('user-456', 'session-789', 'Show me traditional jewelry', conversationId);

    // Follow-up (implicit context)
    const response = await chatService.chat('user-456', 'session-789', 'Make it more colorful', conversationId);

    expect(response.response).toContain('jewelry');
    expect(response.response).toContain('color');
  });
});
```

### 3.2 Style Profiling

**Integration Tests:**
```typescript
// apps/aivision-service/src/__tests__/integration/style-profiler.test.ts

describe('Style Profiler Integration', () => {
  it('should build accurate style profile', async () => {
    const userId = 'user-profile-test';

    // Seed user data
    await seedUserActivity(userId, {
      concepts: 20,
      favorites: 5,
      orders: 2,
      preferences: {
        colors: ['blue', 'gold', 'white'],
        materials: ['ceramic', 'wood'],
        categories: ['vases', 'bowls'],
      },
    });

    // Build profile
    const profile = await styleProfiler.buildProfile(userId);

    expect(profile.preferences.colors).toContainEqual({
      color: 'blue',
      affinity: expect.any(Number),
    });
    expect(profile.styleVector).toHaveLength(128);
    expect(profile.patterns.conversionRate).toBeCloseTo(0.1); // 2/20
  });
});
```

---

## Phase 4: Innovation Testing

### 4.1 AR Preview

**Unit Tests:**
```typescript
// apps/aivision-service/src/__tests__/services/ar-preview.service.test.ts

describe('ARPreviewService', () => {
  it('should analyze scene correctly', async () => {
    const sceneImage = await loadTestImage('living-room.jpg');
    
    const analysis = await arService.analyzeScene(sceneImage, 'room');

    expect(analysis.surfaces).toBeDefined();
    expect(analysis.depthMap).toBeDefined();
    expect(analysis.lighting).toHaveProperty('brightness');
  });

  it('should suggest optimal placement', async () => {
    const sceneAnalysis = {
      surfaces: [
        { type: 'horizontal', area: 5000, center: { x: 500, y: 600 } },
        { type: 'horizontal', area: 2000, center: { x: 300, y: 400 } },
      ],
      depthMap: {},
      objects: [],
      lighting: {},
      dimensions: { width: 1920, height: 1080 },
    };

    const placement = await arService.suggestPlacement(sceneAnalysis, {
      dimensions: { width: 30, height: 40, depth: 30 },
    });

    expect(placement.x).toBe(500); // Largest surface
    expect(placement.y).toBe(600);
    expect(placement.scale).toBeGreaterThan(0);
  });
});
```

### 4.2 Video Generation

**Integration Tests:**
```typescript
// apps/aivision-service/src/__tests__/integration/video-generation.test.ts

describe('Video Generation Integration', () => {
  it('should queue and process video generation', async () => {
    const conceptId = 'concept-video-test';
    
    // Create job
    const job = await videoService.generateVideo({
      conceptId,
      style: 'showcase',
      duration: 15,
      music: true,
    });

    expect(job.status).toBe('queued');

    // Wait for processing (max 3 min)
    const result = await waitForJob(job.jobId, 180000);

    expect(result.status).toBe('completed');
    expect(result.videoUrl).toBeDefined();

    // Verify video accessible
    const response = await fetch(result.videoUrl);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('video');
  });
}, 300000); // 5min timeout
```

---

## Performance Testing

### Load Tests

```typescript
// apps/aivision-service/src/__tests__/performance/load.test.ts

import autocannon from 'autocannon';

describe('Load Tests', () => {
  it('should handle 100 concurrent concept creations', async () => {
    const result = await autocannon({
      url: `http://localhost:3000/api/v1/ai/concepts/create`,
      connections: 100,
      duration: 30,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        referenceImages: ['https://example.com/image.jpg'],
        textPrompt: 'Traditional ceramic vase',
      }),
    });

    expect(result.errors).toBe(0);
    expect(result.latency.p99).toBeLessThan(5000); // 99th percentile < 5s
    expect(result.requests.average).toBeGreaterThan(10); // >10 req/sec
  });

  it('should handle 1000 concurrent searches', async () => {
    const result = await autocannon({
      url: `http://localhost:3000/api/v1/ai/search`,
      connections: 1000,
      duration: 30,
      method: 'POST',
      body: JSON.stringify({
        queryText: 'blue ceramic',
      }),
    });

    expect(result.latency.p99).toBeLessThan(1000); // < 1s
    expect(result.requests.average).toBeGreaterThan(100);
  });
});
```

---

## Test Coverage Requirements

| Component | Target Coverage | Priority |
|-----------|-----------------|----------|
| Services | > 90% | High |
| Controllers | > 80% | High |
| Middleware | > 95% | Critical |
| Utilities | > 85% | Medium |
| ML Models | > 70% | Medium |

---

## CI/CD Testing Pipeline

```yaml
# .github/workflows/test.yml

name: Test Suite

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: pnpm install
      - run: pnpm test:unit
      
  integration-tests:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:7
      redis:
        image: redis:7
    steps:
      - uses: actions/checkout@v3
      - run: pnpm install
      - run: pnpm test:integration
      
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: pnpm install
      - run: pnpm test:e2e
      
  performance-tests:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - run: pnpm install
      - run: pnpm test:performance
```

---

*Comprehensive testing ensures quality across all phases*
