# Phase 2: Engagement & Discovery - Implementation Guide

**Duration:** 12 weeks (Q2 2026)  
**Team:** 3 Backend, 2 Frontend, 1 Designer, 1 QA  
**Goal:** Increase engagement, enable discovery, add social features

---

## 📋 Overview

Phase 2 builds on the solid foundation from Phase 1 to add features that keep users engaged longer, help them discover more products, and enable social sharing. This phase will significantly increase session duration and return visits.

---

## 🎯 Features & Timeline

### Week 1-3: Concept Sharing & Collaboration

**Goal:** Enable users to share concepts and get feedback

#### Backend Implementation

**1. Sharing Service (Week 1)**

```typescript
// apps/aivision-service/src/services/sharing.service.ts

export interface ShareConceptRequest {
  conceptId: string;
  userId?: string;
  options: {
    allowComments: boolean;
    allowVoting: boolean;
    expiresIn?: number; // hours
    shareWith?: string[]; // Specific user emails
    isPublic: boolean;
  };
}

export async function createShareLink(request: ShareConceptRequest) {
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

  // Generate unique share token
  const shareToken = generateShareToken();
  const expiresAt = request.options.expiresIn
    ? new Date(Date.now() + request.options.expiresIn * 60 * 60 * 1000)
    : null;

  const sharedConcept = await prisma.sharedConcept.create({
    data: {
      conceptId: request.conceptId,
      shareToken,
      sharedBy: request.userId,
      
      allowComments: request.options.allowComments,
      allowVoting: request.options.allowVoting,
      isPublic: request.options.isPublic,
      sharedWith: request.options.shareWith || [],
      
      expiresAt,
      
      metadata: {
        conceptTitle: concept.generatedProduct?.title || 'AI Generated Concept',
        primaryImage: concept.primaryImageUrl,
      } as any,
    },
  });

  const shareLink = `${process.env.FRONTEND_URL}/share/${shareToken}`;

  return {
    success: true,
    shareToken,
    shareLink,
    qrCode: await generateQRCode(shareLink),
    sharedConcept,
  };
}

export async function getSharedConcept(shareToken: string, viewerId?: string) {
  const shared = await prisma.sharedConcept.findUnique({
    where: { shareToken },
    include: {
      concept: {
        include: {
          images: true,
          generatedProduct: true,
          artisanMatches: {
            where: { overallScore: { gte: 0.6 } },
            take: 3,
            include: {
              seller: {
                include: { shops: true },
              },
            },
          },
        },
      },
      comments: {
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
      },
      votes: true,
    },
  });

  if (!shared) {
    throw new Error('Share link not found');
  }

  if (shared.expiresAt && shared.expiresAt < new Date()) {
    throw new Error('Share link has expired');
  }

  // Check access permissions
  if (!shared.isPublic && !shared.sharedWith.includes(viewerId || '')) {
    throw new Error('Access denied');
  }

  // Increment view count
  await prisma.sharedConcept.update({
    where: { shareToken },
    data: {
      viewCount: { increment: 1 },
      lastViewedAt: new Date(),
    },
  });

  return {
    ...shared,
    canComment: shared.allowComments,
    canVote: shared.allowVoting,
    hasVoted: viewerId ? shared.votes.some(v => v.userId === viewerId) : false,
  };
}

export async function addComment(
  shareToken: string,
  userId: string,
  comment: string,
  parentCommentId?: string
) {
  const shared = await prisma.sharedConcept.findUnique({
    where: { shareToken },
  });

  if (!shared?.allowComments) {
    throw new Error('Comments not allowed');
  }

  const newComment = await prisma.conceptComment.create({
    data: {
      sharedConceptId: shared.id,
      userId,
      comment,
      parentCommentId,
    },
    include: {
      user: {
        select: { id: true, name: true, avatar: true },
      },
    },
  });

  // Notify concept owner
  await notifyConceptOwner(shared.conceptId, 'comment', newComment);

  return newComment;
}

export async function voteOnConcept(
  shareToken: string,
  userId: string,
  voteType: 'upvote' | 'downvote'
) {
  const shared = await prisma.sharedConcept.findUnique({
    where: { shareToken },
  });

  if (!shared?.allowVoting) {
    throw new Error('Voting not allowed');
  }

  // Upsert vote
  const vote = await prisma.conceptVote.upsert({
    where: {
      sharedConceptId_userId: {
        sharedConceptId: shared.id,
        userId,
      },
    },
    create: {
      sharedConceptId: shared.id,
      userId,
      voteType,
    },
    update: {
      voteType,
    },
  });

  // Update vote counts
  const counts = await prisma.conceptVote.groupBy({
    by: ['voteType'],
    where: { sharedConceptId: shared.id },
    _count: true,
  });

  return {
    vote,
    upvotes: counts.find(c => c.voteType === 'upvote')?._count || 0,
    downvotes: counts.find(c => c.voteType === 'downvote')?._count || 0,
  };
}
```

**Database Schema:**

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

---

### Week 4-6: Visual Comparison Engine

**Goal:** Help buyers compare concepts and products side-by-side

#### Backend Implementation

**1. Comparison Service (Week 4)**

```typescript
// apps/aivision-service/src/services/comparison.service.ts

export interface ComparisonItem {
  type: 'concept' | 'product';
  id: string;
}

export interface ComparisonSet {
  id?: string;
  userId?: string;
  sessionToken: string;
  items: ComparisonItem[];
  metadata?: {
    title?: string;
    category?: string;
  };
}

export async function createComparison(request: ComparisonSet) {
  // Validate items (max 5)
  if (request.items.length > 5) {
    throw new Error('Maximum 5 items allowed in comparison');
  }

  // Fetch all items
  const items = await Promise.all(
    request.items.map(item => fetchComparisonItem(item))
  );

  // Extract common attributes for comparison
  const attributes = extractCommonAttributes(items);

  // Calculate differences
  const differences = calculateDifferences(items);

  // Determine "winners" for each attribute
  const winners = determineWinners(items, attributes);

  const comparison = await prisma.comparisonSet.create({
    data: {
      userId: request.userId,
      sessionToken: request.sessionToken,
      items: request.items as any,
      metadata: request.metadata as any,
    },
  });

  return {
    comparisonId: comparison.id,
    items,
    attributes,
    differences,
    winners,
    summary: generateComparisonSummary(items, winners),
  };
}

async function fetchComparisonItem(item: ComparisonItem) {
  if (item.type === 'concept') {
    return prisma.concept.findUnique({
      where: { id: item.id },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        generatedProduct: true,
      },
    });
  } else {
    return prisma.products.findUnique({
      where: { id: item.id },
      include: {
        shops: {
          select: {
            name: true,
            ratings: true,
          },
        },
      },
    });
  }
}

function extractCommonAttributes(items: any[]) {
  const attributes = [
    {
      key: 'price',
      label: 'Price',
      type: 'range' as const,
      values: items.map(item => ({
        id: item.id,
        value: item.generatedProduct?.estimatedPriceMin || item.current_price || 0,
        display: formatPrice(item),
      })),
    },
    {
      key: 'materials',
      label: 'Materials',
      type: 'tags' as const,
      values: items.map(item => ({
        id: item.id,
        value: item.generatedProduct?.materials || item.materials || [],
      })),
    },
    {
      key: 'style',
      label: 'Style',
      type: 'text' as const,
      values: items.map(item => ({
        id: item.id,
        value: item.generatedProduct?.styleKeywords?.[0] || item.subCategory || 'N/A',
      })),
    },
    {
      key: 'availability',
      label: 'Availability',
      type: 'text' as const,
      values: items.map(item => ({
        id: item.id,
        value: item.stock > 0 ? 'In Stock' : 'Made to Order',
      })),
    },
  ];

  return attributes;
}

function determineWinners(items: any[], attributes: any[]) {
  const winners: Record<string, string[]> = {};

  attributes.forEach(attr => {
    switch (attr.key) {
      case 'price':
        const minPrice = Math.min(...attr.values.map((v: any) => v.value));
        winners[attr.key] = attr.values
          .filter((v: any) => v.value === minPrice)
          .map((v: any) => v.id);
        break;

      case 'rating':
        const maxRating = Math.max(...attr.values.map((v: any) => v.value));
        winners[attr.key] = attr.values
          .filter((v: any) => v.value === maxRating)
          .map((v: any) => v.id);
        break;

      // Add more logic for other attributes
    }
  });

  return winners;
}
```

---

### Week 7-9: Smart Filters & Discovery

**Goal:** Implement AI-powered filters and personalized discovery

#### Backend Implementation

**1. Search & Filter Service (Week 7)**

```typescript
// apps/aivision-service/src/services/discovery.service.ts

export interface SmartFilterRequest {
  // Standard filters
  priceRange?: { min: number; max: number };
  categories?: string[];
  materials?: string[];
  
  // AI-powered filters
  vibe?: 'modern' | 'traditional' | 'rustic' | 'elegant' | 'playful';
  occasion?: 'wedding' | 'gift' | 'home' | 'office' | 'festival';
  personalityMatch?: 'minimalist' | 'maximalist' | 'eclectic' | 'classic';
  
  // Smart recommendations
  basedOnMyStyle?: boolean;
  popularWithSimilarBuyers?: boolean;
  trendingNow?: boolean;
  
  // Pagination
  page?: number;
  limit?: number;
}

export async function smartSearch(
  request: SmartFilterRequest,
  userId?: string,
  sessionToken?: string
) {
  let query: any = {
    isSaved: true,
    status: { in: ['GENERATED', 'SAVED', 'SENT_TO_ARTISANS'] },
  };

  // Apply standard filters
  if (request.priceRange) {
    query['generatedProduct.estimatedPriceMin'] = { gte: request.priceRange.min };
    query['generatedProduct.estimatedPriceMax'] = { lte: request.priceRange.max };
  }

  if (request.categories?.length) {
    query['generatedProduct.category'] = { in: request.categories };
  }

  // Apply AI-powered filters
  if (request.vibe) {
    query['generatedProduct.styleKeywords'] = {
      hasSome: getVibeKeywords(request.vibe),
    };
  }

  if (request.occasion) {
    query['generatedProduct.occasions'] = {
      hasSome: [request.occasion],
    };
  }

  // Personalized recommendations
  let orderBy: any = { createdAt: 'desc' };
  
  if (request.basedOnMyStyle && userId) {
    const userPreferences = await getUserStylePreferences(userId);
    query = applyStylePreferences(query, userPreferences);
    orderBy = { relevanceScore: 'desc' };
  }

  if (request.popularWithSimilarBuyers && userId) {
    const similarUsers = await findSimilarUsers(userId);
    const likedConcepts = await getConceptsLikedByUsers(similarUsers);
    query.id = { in: likedConcepts };
  }

  if (request.trendingNow) {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    query.createdAt = { gte: weekAgo };
    orderBy = { viewCount: 'desc' };
  }

  // Execute query
  const [concepts, total] = await Promise.all([
    prisma.concept.findMany({
      where: query,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        generatedProduct: true,
        _count: {
          select: {
            artisanMatches: true,
          },
        },
      },
      orderBy,
      take: request.limit || 20,
      skip: ((request.page || 1) - 1) * (request.limit || 20),
    }),
    prisma.concept.count({ where: query }),
  ]);

  return {
    concepts,
    total,
    page: request.page || 1,
    totalPages: Math.ceil(total / (request.limit || 20)),
    filters: {
      applied: request,
      available: await getAvailableFilters(query),
    },
  };
}

function getVibeKeywords(vibe: string): string[] {
  const vibeMap: Record<string, string[]> = {
    modern: ['minimalist', 'contemporary', 'sleek', 'geometric'],
    traditional: ['heritage', 'classic', 'ornate', 'cultural'],
    rustic: ['natural', 'handmade', 'earthy', 'organic'],
    elegant: ['refined', 'sophisticated', 'luxurious', 'timeless'],
    playful: ['colorful', 'whimsical', 'fun', 'eclectic'],
  };
  
  return vibeMap[vibe] || [];
}
```

---

### Week 10-12: Concept Library & Organization

**Goal:** Let users organize and manage their concepts

#### Backend Implementation

**1. Library Service (Week 10)**

```typescript
// apps/aivision-service/src/services/library.service.ts

export interface ConceptFolder {
  id?: string;
  name: string;
  description?: string;
  isPublic: boolean;
  tags: string[];
  conceptIds: string[];
}

export async function createFolder(
  userId: string,
  folder: ConceptFolder
) {
  return prisma.conceptFolder.create({
    data: {
      userId,
      name: folder.name,
      description: folder.description,
      isPublic: folder.isPublic,
      tags: folder.tags,
      conceptIds: folder.conceptIds,
    },
  });
}

export async function addToFolder(
  folderId: string,
  conceptId: string,
  userId: string
) {
  // Verify ownership
  const folder = await prisma.conceptFolder.findUnique({
    where: { id: folderId },
  });

  if (folder?.userId !== userId) {
    throw new Error('Access denied');
  }

  return prisma.conceptFolder.update({
    where: { id: folderId },
    data: {
      conceptIds: {
        push: conceptId,
      },
    },
  });
}

export async function getUserLibrary(userId: string) {
  const [folders, favorites, recentlyViewed] = await Promise.all([
    prisma.conceptFolder.findMany({
      where: { userId },
      include: {
        _count: {
          select: { conceptIds: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    
    prisma.concept.findMany({
      where: {
        session: { userId },
        isFavorite: true,
      },
      orderBy: { savedAt: 'desc' },
      take: 20,
    }),
    
    prisma.analyticsEvent.findMany({
      where: {
        userId,
        eventType: 'concept_viewed',
      },
      orderBy: { timestamp: 'desc' },
      take: 20,
      select: {
        conceptId: true,
        timestamp: true,
      },
    }),
  ]);

  return {
    folders,
    favorites,
    recentlyViewed,
    stats: {
      totalConcepts: favorites.length,
      totalFolders: folders.length,
      totalFavorites: favorites.filter(c => c.isFavorite).length,
    },
  };
}
```

**Database Schema:**

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

## 🧪 Testing Checklist

### Week 3: Sharing
- [ ] Share links generate correctly
- [ ] Access permissions work
- [ ] Comments thread correctly
- [ ] Voting updates in real-time
- [ ] Expired links return proper error
- [ ] QR codes scan correctly

### Week 6: Comparison
- [ ] Max 5 items enforced
- [ ] Attributes extracted correctly
- [ ] Winners determined accurately
- [ ] Comparison saves to database
- [ ] Load test: 1000 comparisons

### Week 9: Smart Filters
- [ ] Standard filters work
- [ ] AI filters return relevant results
- [ ] Personalization uses user history
- [ ] Pagination works
- [ ] Performance < 500ms

### Week 12: Library
- [ ] Folders CRUD operations work
- [ ] Concepts added/removed correctly
- [ ] Public folders visible
- [ ] Recently viewed tracks correctly

---

## 📊 Success Metrics (End of Phase 2)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Share rate | > 25% | Concepts shared / Total |
| Avg concepts per session | > 5 | Tracked via analytics |
| Return visitor rate | > 40% | 7-day return rate |
| Search usage | > 60% | Sessions with search |
| Comparison usage | > 30% | Sessions with compare |

---

*Phase 2 complete specification - Continue to Phase 3 for Intelligence features*
