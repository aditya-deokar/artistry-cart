# AI Vision API - Complete API Specification

> **Document:** 03-API-ENDPOINTS.md  
> **Base URL:** `/api/v1/ai`

---

## 📑 API Index

| Category | Endpoints |
|----------|-----------|
| [Generation](#generation-endpoints) | Text-to-Image, Product Variation, Image-to-Concept |
| [Visual Search](#visual-search-endpoints) | Image Search, Hybrid Search |
| [Concepts](#concept-endpoints) | CRUD, Save, Send to Artisans |
| [Artisan Matching](#artisan-matching-endpoints) | Get Matches, Respond |
| [Gallery](#gallery-endpoints) | Browse, Filter |
| [Schema](#schema-endpoints) | Categories, Materials, Styles |

---

## 🎨 Generation Endpoints

### POST `/generate/text-to-image`

Generate concept images from text description.

**Request:**
```typescript
{
  prompt: string;              // Required: User's description (10-500 chars)
  category?: string;           // Optional: "jewelry", "furniture", etc.
  style?: string;              // Optional: "modern", "rustic", etc.
  material?: string;           // Optional: "wood", "ceramic", etc.
  priceRange?: {
    min?: number;
    max?: number;
  };
  referenceImageUrl?: string;  // Optional: Reference image
  count?: number;              // Default: 4, Max: 6
}
```

**Response:** `201 Created`
```typescript
{
  success: true;
  data: {
    sessionId: string;
    concepts: Array<{
      id: string;
      imageUrl: string;
      thumbnailUrl: string;
      generationPrompt: string;
      analyzedFeatures: {
        category: string;
        style: string[];
        colors: string[];
        materials: string[];
        estimatedDimensions?: object;
      };
      estimatedPrice: {
        min: number;
        max: number;
        confidence: number;
      };
    }>;
    metadata: {
      mode: "TEXT_TO_IMAGE";
      generationTime: number;
      creditsUsed: number;
    };
  };
}
```

---

### POST `/generate/product-variation`

Generate variations based on existing product.

**Request:**
```typescript
{
  productId: string;           // Required: Base product ID
  modifications: string;       // Required: Text description of changes
  adjustments?: {
    color?: string[];
    size?: { width?, height?, depth? };
    material?: string[];
    style?: string;
  };
  count?: number;              // Default: 4
}
```

**Response:** `201 Created`
```typescript
{
  success: true;
  data: {
    sessionId: string;
    baseProduct: {
      id: string;
      name: string;
      imageUrl: string;
      price: number;
      category: string;
      artisan: { id, name, shopName };
    };
    variations: Array<{
      id: string;
      imageUrl: string;
      thumbnailUrl: string;
      modificationsApplied: string[];
      estimatedPriceChange: number;
      analyzedFeatures: object;
    }>;
    suggestedArtisans: Array<{
      id: string;
      name: string;
      shopName: string;
      relevanceScore: number;
      similarWorkCount: number;
    }>;
  };
}
```

---

### POST `/generate/from-image`

Generate concepts inspired by uploaded image.

**Request:** `multipart/form-data`
```typescript
{
  image?: File;                // Either image file
  imageUrl?: string;           // Or image URL
  additionalContext?: string;  // Optional text guidance
  searchDatabase?: boolean;    // Also search for similar (default: true)
}
```

**Response:** `201 Created`
```typescript
{
  success: true;
  data: {
    sessionId: string;
    analyzedFeatures: {
      category: string;
      style: string[];
      colors: string[];
      materials: string[];
      estimatedDimensions: object;
      description: string;
    };
    concepts: Array<ConceptObject>;
    similarDatabaseProducts?: Array<{
      product: ProductObject;
      similarityScore: number;
    }>;
  };
}
```

---

### POST `/generate/refine`

Refine existing concepts with adjustments.

**Request:**
```typescript
{
  conceptId: string;           // Required: Concept to refine
  adjustments: string;         // Required: What to change
  preserveElements?: string[]; // Optional: What to keep
}
```

**Response:** `201 Created`
```typescript
{
  success: true;
  data: {
    originalConceptId: string;
    refinedConcepts: Array<ConceptObject>;
    adjustmentsApplied: string[];
  };
}
```

---

## 🔍 Visual Search Endpoints

### POST `/search/visual`

Search products by image similarity.

**Request:** `multipart/form-data`
```typescript
{
  image?: File;
  imageUrl?: string;
  filters?: {
    category?: string[];
    priceRange?: { min?, max? };
    inStock?: boolean;
    artisanId?: string;
  };
  threshold?: number;          // Min similarity (0-1), default: 0.7
  limit?: number;              // Default: 20, Max: 50
}
```

**Response:** `200 OK`
```typescript
{
  success: true;
  data: {
    matches: Array<{
      product: {
        id: string;
        title: string;
        imageUrl: string;
        price: number;
        category: string;
        artisan: { id, name };
        inStock: boolean;
      };
      similarityScore: number;
      matchedFeatures: {
        primaryColor: string;
        shape: string;
        style: string[];
      };
    }>;
    totalMatches: number;
    searchId: string;
    canGenerate: boolean;      // Offer generation if low matches
  };
}
```

---

### POST `/search/hybrid`

Combined visual + text search.

**Request:**
```typescript
{
  image?: File | string;
  textQuery?: string;
  filters?: FilterObject;
  weights?: {
    visual: number;            // Default: 0.6
    text: number;              // Default: 0.4
  };
}
```

---

## 💾 Concept Endpoints

### GET `/concepts`

List user's concepts.

**Query Parameters:**
```
?status=SAVED|GENERATED|SENT_TO_ARTISANS
&mode=TEXT_TO_IMAGE|PRODUCT_VARIATION|VISUAL_SEARCH
&limit=20
&offset=0
&sortBy=createdAt|viewCount
&order=desc|asc
```

---

### GET `/concepts/:id`

Get single concept details.

---

### POST `/concepts/:id/save`

Save concept to user's collection.

---

### DELETE `/concepts/:id`

Delete concept (soft delete).

---

### POST `/concepts/:id/send-to-artisans`

Send concept to selected artisans.

**Request:**
```typescript
{
  artisanIds: string[];        // Required: Seller IDs
  message?: string;            // Optional personalized note
  budget?: { min?, max? };     // Optional budget range
  deadline?: string;           // Optional ISO date
}
```

**Response:** `200 OK`
```typescript
{
  success: true;
  data: {
    sent: number;
    artisansNotified: Array<{
      id: string;
      name: string;
      estimatedResponseTime: string;
    }>;
    matchId: string;
  };
}
```

---

## 👥 Artisan Matching Endpoints

### GET `/artisans/match`

Get matched artisans for a concept.

**Query:** `?conceptId=xxx`

**Response:**
```typescript
{
  success: true;
  data: {
    matches: Array<{
      artisan: {
        id: string;
        name: string;
        shopName: string;
        avatar: string;
        location: string;
        rating: number;
        reviewCount: number;
        specialties: string[];
        responseTime: string;
        priceRange: { min, max };
        portfolioImages: string[];
      };
      scores: {
        overall: number;
        style: number;
        material: number;
        expertise: number;
        availability: number;
        priceMatch: number;
      };
      matchReasons: string[];
      similarWork: Array<{
        productId: string;
        imageUrl: string;
        similarity: number;
      }>;
    }>;
    conceptId: string;
  };
}
```

---

### POST `/artisans/respond`

Artisan responds to concept request.

**Request:**
```typescript
{
  matchId: string;
  response: "INTERESTED" | "QUOTED" | "DECLINED";
  message?: string;
  quote?: {
    price: number;
    timeline: string;
    notes?: string;
  };
}
```

---

## 🖼️ Gallery Endpoints

### GET `/gallery`

Browse public concept gallery.

**Query Parameters:**
```
?category=jewelry|furniture|art|home-decor
&status=REALIZED|IN_PROGRESS|GENERATED
&sortBy=popularity|recent
&limit=20
&offset=0
```

---

### GET `/gallery/:id`

Get gallery item with prompt.

---

## 📋 Schema Endpoints

### GET `/schema/categories`

Get available categories and subcategories.

---

### GET `/schema/materials`

Get material options.

---

### GET `/schema/styles`

Get style keywords.

---

## ⚠️ Error Responses

```typescript
{
  success: false;
  error: {
    code: string;              // "VALIDATION_ERROR", "RATE_LIMITED", etc.
    message: string;
    details?: object;
  };
}
```

**Common Status Codes:**
- `400` - Bad Request (validation failed)
- `401` - Unauthorized
- `403` - Forbidden (quota exceeded)
- `404` - Not Found
- `429` - Rate Limited
- `500` - Internal Server Error
- `503` - Service Unavailable (AI service down)

---

## 🔒 Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/generate/*` | 10 requests | 1 minute |
| `/search/*` | 30 requests | 1 minute |
| `/concepts/*` | 60 requests | 1 minute |
| `/gallery/*` | 100 requests | 1 minute |

---

*Previous: [02-DATABASE-SCHEMA.md](./02-DATABASE-SCHEMA.md) | Next: [04-AI-INFRASTRUCTURE.md](./04-AI-INFRASTRUCTURE.md)*
