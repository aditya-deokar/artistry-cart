// ============================================
// AI VISION API TYPE DEFINITIONS
// ============================================

// ============================================
// COMMON TYPES
// ============================================

export interface APIResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
}

export interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    pages: number;
}

export interface PriceRange {
    min: number;
    max: number;
    confidence?: number;
    rationale?: string;
}

// ============================================
// GENERATED IMAGE TYPES
// ============================================

export interface GeneratedImage {
    id: string;
    url: string;
    thumbnailUrl: string;
    position: number;
    isPrimary: boolean;
    dominantColors?: string[];
}

// ============================================
// GENERATED PRODUCT TYPES
// ============================================

export interface GeneratedProduct {
    id?: string;
    title: string;
    description: string;
    detailedDescription?: string;
    category: string;
    subCategory?: string;
    tags?: string[];
    colors?: string[];
    sizes?: string[];
    materials: string[];
    customSpecifications?: Record<string, unknown>;
    estimatedPriceMin: number;
    estimatedPriceMax: number;
    priceConfidence?: number;
    pricingRationale?: string;
    requiredSkills?: string[];
    estimatedDuration?: string;
    complexityLevel: 'simple' | 'moderate' | 'complex' | 'expert';
    styleKeywords?: string[];
    designNotes?: string;
    feasibilityScore?: number;
    feasibilityNotes?: string;
}

export interface ProductFromAPI {
    title: string;
    description: string;
    category: string;
    priceRange: PriceRange;
    materials: string[];
    complexity: 'simple' | 'moderate' | 'complex' | 'expert';
}

// ============================================
// CONCEPT TYPES
// ============================================

export type ConceptStatus =
    | 'GENERATING'
    | 'GENERATED'
    | 'SAVED'
    | 'SENT_TO_ARTISANS'
    | 'IN_PROGRESS'
    | 'REALIZED'
    | 'FAILED';

export interface Concept {
    id: string;
    prompt: string;
    enhancedPrompt?: string;
    images: GeneratedImage[];
    product: GeneratedProduct | null;
    analyzedFeatures?: Record<string, unknown>;
    isSaved: boolean;
    isFavorite: boolean;
    status: ConceptStatus;
    createdAt: string;
}

export interface ConceptSummary {
    id: string;
    prompt: string;
    thumbnailUrl: string;
    isSaved: boolean;
    isFavorite: boolean;
    status: ConceptStatus;
    product: {
        title: string;
        category: string;
        priceRange: PriceRange;
    } | null;
    createdAt: string;
}

// ============================================
// GENERATION REQUEST/RESPONSE TYPES
// ============================================

export interface TextToImageParams {
    prompt: string;
    category?: string;
    style?: string;
    material?: string;
    count?: number;
}

export interface ProductVariationParams {
    productId: string;
    modifications: string;
    adjustments?: {
        color?: string[];
        size?: unknown;
        material?: string[];
        style?: string;
    };
    count?: number;
}

export interface RefineConceptParams {
    conceptId: string;
    adjustments: string;
    preserveElements?: string[];
}

export interface GenerationResponseData {
    conceptId: string;
    sessionId: string;
    sessionToken: string;
    images: GeneratedImage[];
    product: ProductFromAPI | null;
    enhancedPrompt?: string;
    analyzedIntent?: Record<string, unknown>;
    partialSuccess?: boolean;
    errors?: Array<{ index: number; error: string }>;
}

export interface ProductVariationResponseData extends GenerationResponseData {
    baseProduct: {
        id: string;
        title: string;
        thumbnailUrl: string;
    };
    modifications: string;
}

export interface RefineConceptResponseData extends GenerationResponseData {
    originalConceptId: string;
    newConceptId: string;
    adjustmentsApplied: string;
}

// ============================================
// SEARCH TYPES
// ============================================

export interface SearchFilters {
    category?: string[];
    priceRange?: {
        min?: number;
        max?: number;
    };
    inStock?: boolean;
    artisanId?: string;
}

export interface VisualSearchParams {
    imageUrl?: string;
    imageBase64?: string;
    filters?: SearchFilters;
    threshold?: number;
    limit?: number;
}

export interface HybridSearchParams {
    query?: string;
    imageUrl?: string;
    weights?: {
        text: number;
        visual: number;
    };
    filters?: SearchFilters;
    limit?: number;
}

export interface SearchResult {
    id: string;
    title: string;
    thumbnail: string;
    price: number;
    category: string;
    similarity?: number;
}

export interface SearchResponseData {
    results: SearchResult[];
    total: number;
    searchType: 'visual' | 'text' | 'hybrid';
}

export interface QuickSearchResult {
    id: string;
    title: string;
    thumbnail: string;
    price: number;
    category: string;
}

// ============================================
// CONCEPT MANAGEMENT TYPES
// ============================================

export interface ListConceptsParams {
    saved?: boolean;
    limit?: number;
    offset?: number;
}

export interface ConceptListResponseData {
    concepts: ConceptSummary[];
    total: number;
    limit: number;
    offset: number;
}

export interface SaveConceptParams {
    title?: string;
}

export interface SendToArtisansParams {
    artisanIds: string[];
    message?: string;
    budget?: {
        min?: number;
        max?: number;
    };
    deadline?: string;
}

// ============================================
// GALLERY TYPES
// ============================================

export interface GalleryParams {
    page?: number;
    limit?: number;
    category?: string;
    sortBy?: 'recent' | 'popular' | 'favorites';
}

export interface GalleryItem {
    id: string;
    title: string;
    thumbnailUrl: string;
    imageUrl: string;
    category: string;
    subCategory?: string;
    priceRange: PriceRange | null;
    materials: string[];
    styleKeywords: string[];
    viewCount: number;
    isFavorite: boolean;
    matchCount: number;
    status: ConceptStatus;
    createdAt: string;
}

export interface GalleryItemDetail extends GalleryItem {
    prompt: string;
    enhancedPrompt?: string;
    images: GeneratedImage[];
    product: GeneratedProduct | null;
    interestedArtisans: number;
}

export interface GalleryResponseData {
    items: GalleryItem[];
    pagination: PaginationInfo;
}

export interface RelatedItemsResponseData {
    items: Array<{
        id: string;
        title: string;
        thumbnailUrl: string;
        category?: string;
        priceRange: PriceRange | null;
    }>;
}

// ============================================
// ARTISAN TYPES
// ============================================

export type MatchStatus =
    | 'PENDING'
    | 'INTERESTED'
    | 'QUOTED'
    | 'DECLINED'
    | 'ACCEPTED'
    | 'COMPLETED';

export interface ArtisanShop {
    name: string;
    avatar: string | null;
    rating: number;
    category: string;
}

export interface ArtisanMatchScores {
    skillMatch?: number;
    priceMatch?: number;
    styleMatch?: number;
    [key: string]: number | undefined;
}

export interface ArtisanMatch {
    id: string;
    sellerId: string;
    shop: ArtisanShop | null;
    overallScore: number;
    scores: ArtisanMatchScores;
    matchReasons: string[];
    status: MatchStatus;
    response?: string;
    quote?: {
        price: number;
        timeline: string;
    };
    respondedAt?: string;
}

export interface ArtisanMatchesResponseData {
    matches: ArtisanMatch[];
    total: number;
}

export interface SellerMatch {
    id: string;
    concept: {
        id: string;
        thumbnailUrl: string;
        title: string;
        description?: string;
        category?: string;
        priceRange: PriceRange | null;
        materials?: string[];
    };
    overallScore: number;
    matchReasons: string[];
    status: MatchStatus;
    createdAt: string;
}

export interface ArtisanResponseParams {
    matchId: string;
    response: 'INTERESTED' | 'QUOTED' | 'DECLINED';
    message?: string;
    quote?: {
        price: number;
        timeline: string;
    };
}

// ============================================
// SCHEMA/METADATA TYPES
// ============================================

export interface CategoriesResponseData {
    categories: string[];
    subCategories: Record<string, string[]>;
}

export interface MaterialsResponseData {
    materials: string[];
}

export interface StylesResponseData {
    styles: string[];
}

// ============================================
// SESSION TYPES
// ============================================

export interface SessionInfo {
    sessionId: string;
    sessionToken: string;
    userId?: string;
}

// ============================================
// FRONTEND ADAPTER TYPES
// These are used by frontend components
// ============================================

/** Adapted type for ConceptCard component */
export interface ConceptCardData {
    id: string;
    imageUrl: string;
    thumbnailUrl: string;
    title: string;
    description: string;
    category: string;
    priceRange?: PriceRange;
    materials?: string[];
    complexity?: 'simple' | 'moderate' | 'complex' | 'expert';
    isSaved?: boolean;
    isFavorite?: boolean;
}

/** Adapted type for GalleryItem component */
export interface GalleryItemData {
    id: string;
    imageUrl: string;
    category: string;
    title: string;
    author?: string;
    likes: number;
    views: number;
    status: 'realized' | 'in-progress' | 'awaiting';
    prompt: string;
    aspectRatio: 'portrait' | 'landscape' | 'square';
    priceRange?: PriceRange;
    materials?: string[];
}

/** Adapted type for ArtisanProfileCard component */
export interface ArtisanCardData {
    id: string;
    sellerId: string;
    name: string;
    studio: string;
    location: string;
    rating: number;
    reviewCount: number;
    specialties: string[];
    responseTime: string;
    priceRange: string;
    avatar: string;
    portfolio: string[];
    matchScore?: number;
    matchReasons?: string[];
    status?: MatchStatus;
}
