# Phase 3: Intelligence & Personalization - Implementation Guide

**Duration:** 12 weeks (Q3 2026)  
**Team:** 4 Backend, 2 Frontend, 1 ML Engineer, 1 QA  
**Goal:** Make the system intelligent with AI assistance and personalization

---

## 📋 Overview

Phase 3 transforms the platform from a tool into an intelligent shopping companion. We'll add conversational AI, predictive analytics, style profiling, and a full ML pipeline for recommendations.

---

## 🎯 Features & Timeline

### Week 1-4: AI Shopping Assistant (Chat)

**Goal:** Build conversational AI to guide buyers through their journey

#### Backend Implementation

**1. Chat Service with LangGraph (Week 1-2)**

```typescript
// apps/aivision-service/src/services/chat.service.ts

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { StateGraph, MemorySaver, Annotation } from '@langchain/langgraph';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';

// Define conversation state
const ConversationState = Annotation.Root({
  messages: Annotation<any[]>({
    reducer: (x, y) => x.concat(y),
  }),
  userId: Annotation<string>(),
  sessionToken: Annotation<string>(),
  context: Annotation<any>({
    reducer: (x, y) => ({ ...x, ...y }),
  }),
  nextAction: Annotation<string | null>(),
});

export class AIChatService {
  private model: ChatGoogleGenerativeAI;
  private graph: any;
  private checkpointer: MemorySaver;

  constructor() {
    this.model = new ChatGoogleGenerativeAI({
      modelName: 'gemini-pro',
      temperature: 0.7,
    });

    this.checkpointer = new MemorySaver();
    this.graph = this.buildGraph();
  }

  private buildGraph() {
    const workflow = new StateGraph(ConversationState);

    // Define nodes
    workflow.addNode('understand_intent', this.understandIntent.bind(this));
    workflow.addNode('fetch_context', this.fetchContext.bind(this));
    workflow.addNode('generate_response', this.generateResponse.bind(this));
    workflow.addNode('execute_action', this.executeAction.bind(this));

    // Define edges
    workflow.addEdge('__start__', 'understand_intent');
    workflow.addConditionalEdges(
      'understand_intent',
      this.routeIntent.bind(this),
      {
        'need_context': 'fetch_context',
        'need_action': 'execute_action',
        'can_respond': 'generate_response',
      }
    );
    workflow.addEdge('fetch_context', 'generate_response');
    workflow.addEdge('execute_action', 'generate_response');
    workflow.addEdge('generate_response', '__end__');

    return workflow.compile({ checkpointer: this.checkpointer });
  }

  private async understandIntent(state: any) {
    const lastMessage = state.messages[state.messages.length - 1];
    
    const intentPrompt = `Analyze this user message and determine intent:
Message: "${lastMessage.content}"

User context:
- Current concepts: ${state.context.conceptCount || 0}
- Recent actions: ${JSON.stringify(state.context.recentActions || [])}

Classify intent as one of:
- SEARCH: User wants to find products
- CREATE: User wants to create new concept
- COMPARE: User wants to compare items
- SHARE: User wants to share concept
- QUESTION: User has a question
- CHITCHAT: General conversation

Return JSON: { "intent": "<intent>", "entities": {...}, "needsContext": boolean, "needsAction": boolean }`;

    const response = await this.model.invoke([
      new SystemMessage(intentPrompt),
    ]);

    const analysis = JSON.parse(response.content.toString());

    return {
      ...state,
      context: {
        ...state.context,
        intent: analysis.intent,
        entities: analysis.entities,
      },
      nextAction: analysis.needsAction ? analysis.intent.toLowerCase() : null,
    };
  }

  private routeIntent(state: any): string {
    const intent = state.context.intent;
    
    if (state.nextAction) {
      return 'need_action';
    }
    
    if (['SEARCH', 'COMPARE'].includes(intent) && !state.context.searchResults) {
      return 'need_context';
    }
    
    return 'can_respond';
  }

  private async fetchContext(state: any) {
    const intent = state.context.intent;
    const entities = state.context.entities;

    let additionalContext: any = {};

    if (intent === 'SEARCH') {
      // Perform semantic search
      const results = await searchConcepts({
        query: entities.query || entities.keywords?.join(' '),
        userId: state.userId,
        limit: 5,
      });
      additionalContext.searchResults = results;
    }

    if (intent === 'COMPARE' && entities.conceptIds) {
      const comparison = await createComparison({
        userId: state.userId,
        sessionToken: state.sessionToken,
        items: entities.conceptIds.map((id: string) => ({ type: 'concept', id })),
      });
      additionalContext.comparisonData = comparison;
    }

    return {
      ...state,
      context: {
        ...state.context,
        ...additionalContext,
      },
    };
  }

  private async executeAction(state: any) {
    const action = state.nextAction;
    const entities = state.context.entities;
    let actionResult: any = {};

    switch (action) {
      case 'create':
        actionResult = await this.createConceptFromChat(state.userId, entities);
        break;
      
      case 'share':
        actionResult = await this.shareConceptFromChat(entities.conceptId);
        break;
      
      // Add more actions
    }

    return {
      ...state,
      context: {
        ...state.context,
        actionResult,
      },
    };
  }

  private async generateResponse(state: any) {
    const intent = state.context.intent;
    const context = state.context;
    const conversationHistory = state.messages.slice(-10); // Last 10 messages

    const systemPrompt = `You are an AI shopping assistant for Artistry Cart, a platform connecting buyers with artisans.

Your role:
- Help users discover unique handmade products
- Guide concept creation with AI
- Answer questions about artisan products, pricing, materials
- Be friendly, enthusiastic, and knowledgeable

Available context:
${JSON.stringify(context, null, 2)}

Guidelines:
- Keep responses concise (2-3 sentences)
- Use emojis sparingly
- Suggest next actions naturally
- Reference specific products/concepts by name
- Always be encouraging about user's ideas`;

    const response = await this.model.invoke([
      new SystemMessage(systemPrompt),
      ...conversationHistory,
    ]);

    return {
      ...state,
      messages: [...state.messages, new AIMessage(response.content)],
    };
  }

  async chat(userId: string, sessionToken: string, message: string, conversationId?: string) {
    const threadId = conversationId || `${userId}_${Date.now()}`;

    // Load context
    const context = await this.loadUserContext(userId, sessionToken);

    const result = await this.graph.invoke(
      {
        messages: [new HumanMessage(message)],
        userId,
        sessionToken,
        context,
      },
      {
        configurable: { thread_id: threadId },
      }
    );

    // Save conversation
    await this.saveConversation(userId, threadId, message, result.messages[result.messages.length - 1].content);

    return {
      conversationId: threadId,
      response: result.messages[result.messages.length - 1].content,
      suggestions: this.generateSuggestions(result.context),
    };
  }

  private async loadUserContext(userId: string, sessionToken: string) {
    const [concepts, recentActions, preferences] = await Promise.all([
      prisma.concept.findMany({
        where: {
          OR: [
            { session: { userId } },
            { session: { sessionToken } },
          ],
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
      
      prisma.analyticsEvent.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: 20,
      }),
      
      getUserStylePreferences(userId),
    ]);

    return {
      conceptCount: concepts.length,
      recentConcepts: concepts.slice(0, 3),
      recentActions: recentActions.map(a => a.eventType),
      stylePreferences: preferences,
    };
  }

  private generateSuggestions(context: any): string[] {
    const suggestions: string[] = [];

    if (context.searchResults?.length) {
      suggestions.push('Show me details of the first one');
      suggestions.push('Compare top 3 results');
    }

    if (context.intent === 'CREATE') {
      suggestions.push('Help me refine my idea');
      suggestions.push('Find similar products');
    }

    return suggestions.slice(0, 3);
  }
}
```

**Database Schema:**

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

---

### Week 5-7: Realization Progress Tracking

**Goal:** Show users detailed progress of their concepts becoming reality

#### Backend Implementation

**1. Progress Tracking Service (Week 5)**

```typescript
// apps/aivision-service/src/services/progress-tracking.service.ts

export interface RealizationMilestone {
  stage: 'concept' | 'quote_requested' | 'quote_received' | 'order_placed' | 'production' | 'shipping' | 'delivered';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  completedAt?: Date;
  estimatedCompletion?: Date;
  notes?: string;
}

export async function trackRealization(conceptId: string) {
  const concept = await prisma.concept.findUnique({
    where: { id: conceptId },
    include: {
      artisanMatches: {
        include: {
          quotes: true,
          seller: true,
        },
      },
      orders: {
        include: {
          orderItems: true,
        },
      },
    },
  });

  if (!concept) {
    throw new Error('Concept not found');
  }

  const milestones: RealizationMilestone[] = [
    {
      stage: 'concept',
      status: 'completed',
      completedAt: concept.createdAt,
    },
  ];

  // Quote stage
  const quotesRequested = concept.artisanMatches.length > 0;
  const quotesReceived = concept.artisanMatches.some(m => m.quotes.length > 0);
  
  milestones.push({
    stage: 'quote_requested',
    status: quotesRequested ? 'completed' : 'pending',
    completedAt: quotesRequested ? concept.artisanMatches[0].createdAt : undefined,
  });

  milestones.push({
    stage: 'quote_received',
    status: quotesReceived ? 'completed' : quotesRequested ? 'in_progress' : 'pending',
    completedAt: quotesReceived ? concept.artisanMatches[0].quotes[0].createdAt : undefined,
  });

  // Order stage
  const orderPlaced = concept.orders.length > 0;
  milestones.push({
    stage: 'order_placed',
    status: orderPlaced ? 'completed' : 'pending',
    completedAt: orderPlaced ? concept.orders[0].createdAt : undefined,
  });

  // Production & shipping
  if (orderPlaced) {
    const order = concept.orders[0];
    milestones.push({
      stage: 'production',
      status: order.status === 'processing' ? 'in_progress' : order.status === 'shipped' ? 'completed' : 'pending',
      estimatedCompletion: order.estimatedDelivery,
    });

    milestones.push({
      stage: 'shipping',
      status: order.status === 'shipped' ? 'in_progress' : order.status === 'delivered' ? 'completed' : 'pending',
      estimatedCompletion: order.estimatedDelivery,
    });

    milestones.push({
      stage: 'delivered',
      status: order.status === 'delivered' ? 'completed' : 'pending',
      completedAt: order.deliveredAt,
    });
  }

  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  const progressPercent = (completedMilestones / milestones.length) * 100;

  return {
    conceptId,
    milestones,
    progress: {
      percent: Math.round(progressPercent),
      completed: completedMilestones,
      total: milestones.length,
    },
    currentStage: milestones.find(m => m.status === 'in_progress')?.stage || 
                   milestones.filter(m => m.status === 'completed').slice(-1)[0]?.stage || 
                   'concept',
    estimatedCompletion: milestones.find(m => m.estimatedCompletion)?.estimatedCompletion,
  };
}
```

---

### Week 8-10: Style Profiles & Preferences

**Goal:** Build comprehensive user style profiles for personalization

#### ML Implementation

**1. Style Profile Builder (Week 8)**

```typescript
// apps/aivision-service/src/ml/style-profiler.service.ts

export interface StyleProfile {
  userId: string;
  styleVector: number[]; // 128-dim embedding
  preferences: {
    colors: { color: string; affinity: number }[];
    materials: { material: string; affinity: number }[];
    categories: { category: string; affinity: number }[];
    priceRange: { min: number; max: number; preferred: number };
  };
  patterns: {
    browsingTime: { dayOfWeek: number; hour: number }[];
    sessionDuration: number; // avg minutes
    conversionRate: number;
  };
  demographics?: {
    age?: number;
    gender?: string;
    location?: string;
  };
  lastUpdated: Date;
}

export class StyleProfiler {
  private embedModel: GoogleGenerativeAIEmbeddings;

  constructor() {
    this.embedModel = new GoogleGenerativeAIEmbeddings({
      modelName: 'text-embedding-004',
    });
  }

  async buildProfile(userId: string): Promise<StyleProfile> {
    // Gather user's interaction history
    const [
      concepts,
      favorites,
      orders,
      searches,
      analyticsEvents,
    ] = await Promise.all([
      prisma.concept.findMany({
        where: { session: { userId } },
        include: { generatedProduct: true },
      }),
      
      prisma.concept.findMany({
        where: { 
          session: { userId },
          isFavorite: true,
        },
        include: { generatedProduct: true },
      }),
      
      prisma.order.findMany({
        where: { userId },
        include: { orderItems: true },
      }),
      
      prisma.searchHistory.findMany({
        where: { userId },
      }),
      
      prisma.analyticsEvent.findMany({
        where: { userId },
      }),
    ]);

    // Extract preferences
    const colorPreferences = this.extractColorPreferences(concepts, favorites);
    const materialPreferences = this.extractMaterialPreferences(concepts, favorites);
    const categoryPreferences = this.extractCategoryPreferences(concepts, favorites, orders);
    const priceRange = this.extractPricePreferences(orders, favorites);

    // Analyze behavioral patterns
    const browsingPatterns = this.analyzeBrowsingPatterns(analyticsEvents);

    // Generate style embedding
    const styleDescription = this.generateStyleDescription({
      colors: colorPreferences,
      materials: materialPreferences,
      categories: categoryPreferences,
    });
    
    const styleVector = await this.embedModel.embedQuery(styleDescription);

    const profile: StyleProfile = {
      userId,
      styleVector,
      preferences: {
        colors: colorPreferences,
        materials: materialPreferences,
        categories: categoryPreferences,
        priceRange,
      },
      patterns: {
        browsingTime: browsingPatterns.peakTimes,
        sessionDuration: browsingPatterns.avgSessionDuration,
        conversionRate: orders.length / (concepts.length || 1),
      },
      lastUpdated: new Date(),
    };

    // Save to database
    await prisma.userStyleProfile.upsert({
      where: { userId },
      create: {
        userId,
        profileData: profile as any,
      },
      update: {
        profileData: profile as any,
        updatedAt: new Date(),
      },
    });

    return profile;
  }

  private extractColorPreferences(concepts: any[], favorites: any[]) {
    const colorCount: Record<string, number> = {};
    
    [...concepts, ...favorites].forEach(item => {
      const colors = item.generatedProduct?.colorPalette || [];
      colors.forEach((color: string) => {
        colorCount[color] = (colorCount[color] || 0) + (favorites.includes(item) ? 2 : 1);
      });
    });

    const total = Object.values(colorCount).reduce((a, b) => a + b, 0);
    
    return Object.entries(colorCount)
      .map(([color, count]) => ({
        color,
        affinity: count / total,
      }))
      .sort((a, b) => b.affinity - a.affinity)
      .slice(0, 10);
  }

  private generateStyleDescription(preferences: any): string {
    const topColors = preferences.colors.slice(0, 3).map((c: any) => c.color).join(', ');
    const topMaterials = preferences.materials.slice(0, 3).map((m: any) => m.material).join(', ');
    const topCategories = preferences.categories.slice(0, 3).map((c: any) => c.category).join(', ');

    return `A person who loves ${topColors} colors, prefers ${topMaterials} materials, and is interested in ${topCategories} products.`;
  }
}
```

---

### Week 11-12: ML Recommendation Pipeline

**Goal:** Production-ready recommendation system

#### Infrastructure Implementation

**1. Recommendation Engine (Week 11)**

```typescript
// apps/recommendation-service/src/engines/collaborative-filtering.ts

export class CollaborativeFilteringEngine {
  async generateRecommendations(userId: string, limit: number = 10) {
    // 1. Find similar users
    const userProfile = await getUserStyleProfile(userId);
    if (!userProfile) {
      return this.fallbackRecommendations(limit);
    }

    const similarUsers = await this.findSimilarUsers(userProfile, 50);

    // 2. Get items liked by similar users
    const itemScores: Map<string, number> = new Map();
    
    for (const similarUser of similarUsers) {
      const likedItems = await this.getUserLikedItems(similarUser.userId);
      
      likedItems.forEach(item => {
        const currentScore = itemScores.get(item.id) || 0;
        itemScores.set(item.id, currentScore + similarUser.similarity);
      });
    }

    // 3. Filter out items user already interacted with
    const userItemIds = await this.getUserItemIds(userId);
    const candidateItems = Array.from(itemScores.entries())
      .filter(([itemId]) => !userItemIds.includes(itemId))
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([itemId]) => itemId);

    // 4. Fetch full item details
    return prisma.concept.findMany({
      where: { id: { in: candidateItems } },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        generatedProduct: true,
      },
    });
  }

  private async findSimilarUsers(userProfile: any, limit: number) {
    // Use cosine similarity on style vectors
    const allProfiles = await prisma.userStyleProfile.findMany({
      where: {
        userId: { not: userProfile.userId },
      },
    });

    const similarities = allProfiles.map(profile => ({
      userId: profile.userId,
      similarity: this.cosineSimilarity(
        userProfile.profileData.styleVector,
        profile.profileData.styleVector
      ),
    }));

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
}
```

---

## 🧪 Testing Checklist

### Week 4: Chat Assistant
- [ ] Intent classification > 90% accurate
- [ ] Context retrieval < 200ms
- [ ] Conversation flows naturally
- [ ] Handles 10+ turn conversations
- [ ] Suggestions relevant

### Week 7: Progress Tracking
- [ ] Milestones calculated correctly
- [ ] Real-time updates via WebSocket
- [ ] Notifications sent at stage changes
- [ ] Historical progress stored

### Week 10: Style Profiles
- [ ] Profiles generated < 5s
- [ ] Preferences extracted accurately
- [ ] Embeddings similar for similar users
- [ ] Profile updates incrementally

### Week 12: Recommendations
- [ ] Recommendations relevant (>60% CTR)
- [ ] Latency < 500ms
- [ ] Diversity in results
- [ ] Cold start handled

---

## 📊 Success Metrics (End of Phase 3)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Chat engagement | > 40% | Users who use chat |
| Recommendation CTR | > 60% | Clicks / Impressions |
| Profile accuracy | > 85% | User feedback surveys |
| Realization rate | > 20% | Orders / Concepts |

---

*Phase 3 complete - Continue to Phase 4 for Innovation features*
