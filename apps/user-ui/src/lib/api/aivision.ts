// ============================================
// AI VISION API CLIENT
// ============================================

import axiosInstance from '@/utils/axiosinstance';
import type {
    APIResponse,
    TextToImageParams,
    ProductVariationParams,
    RefineConceptParams,
    GenerationResponseData,
    ProductVariationResponseData,
    RefineConceptResponseData,
    VisualSearchParams,
    HybridSearchParams,
    SearchResponseData,
    QuickSearchResult,
    ListConceptsParams,
    ConceptListResponseData,
    Concept,
    SaveConceptParams,
    SendToArtisansParams,
    GalleryParams,
    GalleryResponseData,
    GalleryItemDetail,
    RelatedItemsResponseData,
    ArtisanMatchesResponseData,
    ArtisanResponseParams,
    CategoriesResponseData,
    MaterialsResponseData,
    StylesResponseData,
    ConceptSummary,
} from '@/types/aivision';

// ============================================
// CONFIGURATION
// ============================================

const AI_VISION_BASE_URL = '/ai-vision/api/v1/ai';

// Session token management
let sessionToken: string | null = null;

const getSessionToken = (): string | null => {
    if (typeof window === 'undefined') return null;

    if (!sessionToken) {
        sessionToken = localStorage.getItem('ai-vision-session-token');
    }
    return sessionToken;
};

const setSessionToken = (token: string): void => {
    sessionToken = token;
    if (typeof window !== 'undefined') {
        localStorage.setItem('ai-vision-session-token', token);
    }
};

const clearSessionToken = (): void => {
    sessionToken = null;
    if (typeof window !== 'undefined') {
        localStorage.removeItem('ai-vision-session-token');
    }
};

// Helper to add session token header
const getHeaders = (): Record<string, string> => {
    const token = getSessionToken();
    return token ? { 'X-Session-Token': token } : {};
};

// ============================================
// GENERATION APIs
// ============================================

/**
 * Generate images from text prompt
 * POST /ai-vision/api/v1/ai/generate/text-to-image
 */
export async function textToImage(
    params: TextToImageParams
): Promise<APIResponse<GenerationResponseData>> {
    try {
        const response = await axiosInstance.post(
            `${AI_VISION_BASE_URL}/generate/text-to-image`,
            params,
            { headers: getHeaders() }
        );

        // Store session token for continuity
        if (response.data?.data?.sessionToken) {
            setSessionToken(response.data.data.sessionToken);
        }

        return response.data;
    } catch (error: any) {
        return {
            success: false,
            error: {
                code: error.response?.data?.error?.code || 'NETWORK_ERROR',
                message: error.response?.data?.error?.message || error.message || 'Failed to generate images',
                details: error.response?.data?.error?.details,
            },
        };
    }
}

/**
 * Generate product variations
 * POST /ai-vision/api/v1/ai/generate/product-variation
 */
export async function productVariation(
    params: ProductVariationParams
): Promise<APIResponse<ProductVariationResponseData>> {
    try {
        const response = await axiosInstance.post(
            `${AI_VISION_BASE_URL}/generate/product-variation`,
            params,
            { headers: getHeaders() }
        );

        if (response.data?.data?.sessionToken) {
            setSessionToken(response.data.data.sessionToken);
        }

        return response.data;
    } catch (error: any) {
        return {
            success: false,
            error: {
                code: error.response?.data?.error?.code || 'NETWORK_ERROR',
                message: error.response?.data?.error?.message || error.message || 'Failed to generate variations',
            },
        };
    }
}

/**
 * Refine an existing concept
 * POST /ai-vision/api/v1/ai/generate/refine
 */
export async function refineConcept(
    params: RefineConceptParams
): Promise<APIResponse<RefineConceptResponseData>> {
    try {
        const response = await axiosInstance.post(
            `${AI_VISION_BASE_URL}/generate/refine`,
            params,
            { headers: getHeaders() }
        );

        if (response.data?.data?.sessionToken) {
            setSessionToken(response.data.data.sessionToken);
        }

        return response.data;
    } catch (error: any) {
        return {
            success: false,
            error: {
                code: error.response?.data?.error?.code || 'NETWORK_ERROR',
                message: error.response?.data?.error?.message || error.message || 'Failed to refine concept',
            },
        };
    }
}

// ============================================
// SEARCH APIs
// ============================================

/**
 * Visual similarity search
 * POST /ai-vision/api/v1/ai/search/visual
 */
export async function visualSearch(
    params: VisualSearchParams
): Promise<APIResponse<SearchResponseData>> {
    try {
        const response = await axiosInstance.post(
            `${AI_VISION_BASE_URL}/search/visual`,
            params,
            { headers: getHeaders() }
        );
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            error: {
                code: error.response?.data?.error?.code || 'NETWORK_ERROR',
                message: error.response?.data?.error?.message || error.message || 'Visual search failed',
            },
        };
    }
}

/**
 * Hybrid text + visual search
 * POST /ai-vision/api/v1/ai/search/hybrid
 */
export async function hybridSearch(
    params: HybridSearchParams
): Promise<APIResponse<SearchResponseData>> {
    try {
        const response = await axiosInstance.post(
            `${AI_VISION_BASE_URL}/search/hybrid`,
            params,
            { headers: getHeaders() }
        );
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            error: {
                code: error.response?.data?.error?.code || 'NETWORK_ERROR',
                message: error.response?.data?.error?.message || error.message || 'Hybrid search failed',
            },
        };
    }
}

/**
 * Find similar concepts by image
 * POST /ai-vision/api/v1/ai/search/similar-concepts
 */
export async function findSimilarConcepts(
    imageUrl: string,
    limit: number = 10,
    threshold: number = 0.7
): Promise<APIResponse<{ concepts: ConceptSummary[]; total: number }>> {
    try {
        const response = await axiosInstance.post(
            `${AI_VISION_BASE_URL}/search/similar-concepts`,
            { imageUrl, limit, threshold },
            { headers: getHeaders() }
        );
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            error: {
                code: error.response?.data?.error?.code || 'NETWORK_ERROR',
                message: error.response?.data?.error?.message || error.message || 'Similar concepts search failed',
            },
        };
    }
}

/**
 * Quick text search for products
 * GET /ai-vision/api/v1/ai/search/quick?q=query
 */
export async function quickSearch(
    query: string,
    limit: number = 10,
    category?: string
): Promise<APIResponse<{ results: QuickSearchResult[]; total: number }>> {
    try {
        const params = new URLSearchParams({ q: query, limit: limit.toString() });
        if (category) params.append('category', category);

        const response = await axiosInstance.get(
            `${AI_VISION_BASE_URL}/search/quick?${params.toString()}`,
            { headers: getHeaders() }
        );
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            error: {
                code: error.response?.data?.error?.code || 'NETWORK_ERROR',
                message: error.response?.data?.error?.message || error.message || 'Quick search failed',
            },
        };
    }
}

// ============================================
// CONCEPT MANAGEMENT APIs
// ============================================

/**
 * List user's concepts
 * GET /ai-vision/api/v1/ai/concepts
 */
export async function listConcepts(
    params?: ListConceptsParams
): Promise<APIResponse<ConceptListResponseData>> {
    try {
        const searchParams = new URLSearchParams();
        if (params?.saved !== undefined) searchParams.append('saved', String(params.saved));
        if (params?.limit !== undefined) searchParams.append('limit', String(params.limit));
        if (params?.offset !== undefined) searchParams.append('offset', String(params.offset));

        const queryString = searchParams.toString();
        const url = `${AI_VISION_BASE_URL}/concepts${queryString ? `?${queryString}` : ''}`;

        const response = await axiosInstance.get(url, { headers: getHeaders() });
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            error: {
                code: error.response?.data?.error?.code || 'NETWORK_ERROR',
                message: error.response?.data?.error?.message || error.message || 'Failed to list concepts',
            },
        };
    }
}

/**
 * Get single concept details
 * GET /ai-vision/api/v1/ai/concepts/:id
 */
export async function getConcept(id: string): Promise<APIResponse<Concept>> {
    try {
        const response = await axiosInstance.get(
            `${AI_VISION_BASE_URL}/concepts/${id}`,
            { headers: getHeaders() }
        );
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            error: {
                code: error.response?.data?.error?.code || 'NETWORK_ERROR',
                message: error.response?.data?.error?.message || error.message || 'Failed to get concept',
            },
        };
    }
}

/**
 * Save concept to user account
 * POST /ai-vision/api/v1/ai/concepts/:id/save
 */
export async function saveConcept(
    id: string,
    params?: SaveConceptParams
): Promise<APIResponse<{ conceptId: string; saved: boolean }>> {
    try {
        const response = await axiosInstance.post(
            `${AI_VISION_BASE_URL}/concepts/${id}/save`,
            params || {},
            { headers: getHeaders() }
        );
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            error: {
                code: error.response?.data?.error?.code || 'NETWORK_ERROR',
                message: error.response?.data?.error?.message || error.message || 'Failed to save concept',
            },
        };
    }
}

/**
 * Delete a concept
 * DELETE /ai-vision/api/v1/ai/concepts/:id
 */
export async function deleteConcept(
    id: string
): Promise<APIResponse<{ conceptId: string; deleted: boolean }>> {
    try {
        const response = await axiosInstance.delete(
            `${AI_VISION_BASE_URL}/concepts/${id}`,
            { headers: getHeaders() }
        );
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            error: {
                code: error.response?.data?.error?.code || 'NETWORK_ERROR',
                message: error.response?.data?.error?.message || error.message || 'Failed to delete concept',
            },
        };
    }
}

/**
 * Send concept to artisans
 * POST /ai-vision/api/v1/ai/concepts/:id/send-to-artisans
 */
export async function sendToArtisans(
    id: string,
    params: SendToArtisansParams
): Promise<APIResponse<{ conceptId: string; matchesSent: number; artisanIds: string[] }>> {
    try {
        const response = await axiosInstance.post(
            `${AI_VISION_BASE_URL}/concepts/${id}/send-to-artisans`,
            params,
            { headers: getHeaders() }
        );
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            error: {
                code: error.response?.data?.error?.code || 'NETWORK_ERROR',
                message: error.response?.data?.error?.message || error.message || 'Failed to send to artisans',
            },
        };
    }
}

// ============================================
// GALLERY APIs
// ============================================

/**
 * Browse public concept gallery
 * GET /ai-vision/api/v1/ai/gallery
 */
export async function getGallery(
    params?: GalleryParams
): Promise<APIResponse<GalleryResponseData>> {
    try {
        const searchParams = new URLSearchParams();
        if (params?.page !== undefined) searchParams.append('page', String(params.page));
        if (params?.limit !== undefined) searchParams.append('limit', String(params.limit));
        if (params?.category) searchParams.append('category', params.category);
        if (params?.sortBy) searchParams.append('sortBy', params.sortBy);

        const queryString = searchParams.toString();
        const url = `${AI_VISION_BASE_URL}/gallery${queryString ? `?${queryString}` : ''}`;

        const response = await axiosInstance.get(url, { headers: getHeaders() });
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            error: {
                code: error.response?.data?.error?.code || 'NETWORK_ERROR',
                message: error.response?.data?.error?.message || error.message || 'Failed to load gallery',
            },
        };
    }
}

/**
 * Get gallery item details
 * GET /ai-vision/api/v1/ai/gallery/:id
 */
export async function getGalleryItem(id: string): Promise<APIResponse<GalleryItemDetail>> {
    try {
        const response = await axiosInstance.get(
            `${AI_VISION_BASE_URL}/gallery/${id}`,
            { headers: getHeaders() }
        );
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            error: {
                code: error.response?.data?.error?.code || 'NETWORK_ERROR',
                message: error.response?.data?.error?.message || error.message || 'Failed to get gallery item',
            },
        };
    }
}

/**
 * Toggle favorite status
 * POST /ai-vision/api/v1/ai/gallery/:id/favorite
 */
export async function toggleFavorite(
    id: string
): Promise<APIResponse<{ id: string; isFavorite: boolean }>> {
    try {
        const response = await axiosInstance.post(
            `${AI_VISION_BASE_URL}/gallery/${id}/favorite`,
            {},
            { headers: getHeaders() }
        );
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            error: {
                code: error.response?.data?.error?.code || 'NETWORK_ERROR',
                message: error.response?.data?.error?.message || error.message || 'Failed to toggle favorite',
            },
        };
    }
}

/**
 * Get related gallery items
 * GET /ai-vision/api/v1/ai/gallery/:id/related
 */
export async function getRelatedItems(
    id: string,
    limit: number = 6
): Promise<APIResponse<RelatedItemsResponseData>> {
    try {
        const response = await axiosInstance.get(
            `${AI_VISION_BASE_URL}/gallery/${id}/related?limit=${limit}`,
            { headers: getHeaders() }
        );
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            error: {
                code: error.response?.data?.error?.code || 'NETWORK_ERROR',
                message: error.response?.data?.error?.message || error.message || 'Failed to get related items',
            },
        };
    }
}

// ============================================
// ARTISAN APIs
// ============================================

/**
 * Get artisan matches for a concept
 * GET /ai-vision/api/v1/ai/artisans/match?conceptId=xxx
 */
export async function getArtisanMatches(
    conceptId: string
): Promise<APIResponse<ArtisanMatchesResponseData>> {
    try {
        const response = await axiosInstance.get(
            `${AI_VISION_BASE_URL}/artisans/match?conceptId=${conceptId}`,
            { headers: getHeaders() }
        );
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            error: {
                code: error.response?.data?.error?.code || 'NETWORK_ERROR',
                message: error.response?.data?.error?.message || error.message || 'Failed to get artisan matches',
            },
        };
    }
}

/**
 * Artisan responds to a match request (seller only)
 * POST /ai-vision/api/v1/ai/artisans/respond
 */
export async function respondToMatch(
    params: ArtisanResponseParams
): Promise<APIResponse<{ matchId: string; status: string; respondedAt: string }>> {
    try {
        const response = await axiosInstance.post(
            `${AI_VISION_BASE_URL}/artisans/respond`,
            params,
            { headers: getHeaders() }
        );
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            error: {
                code: error.response?.data?.error?.code || 'NETWORK_ERROR',
                message: error.response?.data?.error?.message || error.message || 'Failed to respond to match',
            },
        };
    }
}

/**
 * Get seller's pending matches (seller only)
 * GET /ai-vision/api/v1/ai/artisans/my-matches
 */
export async function getSellerMatches(
    status?: string
): Promise<APIResponse<{ matches: any[]; total: number }>> {
    try {
        const params = status ? `?status=${status}` : '';
        const response = await axiosInstance.get(
            `${AI_VISION_BASE_URL}/artisans/my-matches${params}`,
            { headers: getHeaders() }
        );
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            error: {
                code: error.response?.data?.error?.code || 'NETWORK_ERROR',
                message: error.response?.data?.error?.message || error.message || 'Failed to get seller matches',
            },
        };
    }
}

// ============================================
// SCHEMA/METADATA APIs
// ============================================

/**
 * Get available categories
 * GET /ai-vision/api/v1/ai/schema/categories
 */
export async function getCategories(): Promise<APIResponse<CategoriesResponseData>> {
    try {
        const response = await axiosInstance.get(
            `${AI_VISION_BASE_URL}/schema/categories`,
            { headers: getHeaders() }
        );
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            error: {
                code: error.response?.data?.error?.code || 'NETWORK_ERROR',
                message: error.response?.data?.error?.message || error.message || 'Failed to get categories',
            },
        };
    }
}

/**
 * Get material options
 * GET /ai-vision/api/v1/ai/schema/materials
 */
export async function getMaterials(): Promise<APIResponse<MaterialsResponseData>> {
    try {
        const response = await axiosInstance.get(
            `${AI_VISION_BASE_URL}/schema/materials`,
            { headers: getHeaders() }
        );
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            error: {
                code: error.response?.data?.error?.code || 'NETWORK_ERROR',
                message: error.response?.data?.error?.message || error.message || 'Failed to get materials',
            },
        };
    }
}

/**
 * Get style keywords
 * GET /ai-vision/api/v1/ai/schema/styles
 */
export async function getStyles(): Promise<APIResponse<StylesResponseData>> {
    try {
        const response = await axiosInstance.get(
            `${AI_VISION_BASE_URL}/schema/styles`,
            { headers: getHeaders() }
        );
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            error: {
                code: error.response?.data?.error?.code || 'NETWORK_ERROR',
                message: error.response?.data?.error?.message || error.message || 'Failed to get styles',
            },
        };
    }
}

// ============================================
// SESSION UTILITIES
// ============================================

export const sessionUtils = {
    getToken: getSessionToken,
    setToken: setSessionToken,
    clearToken: clearSessionToken,
};

// ============================================
// AGGREGATED API OBJECT
// ============================================

export const aiVisionApi = {
    // Generation
    textToImage,
    productVariation,
    refineConcept,

    // Search
    visualSearch,
    hybridSearch,
    findSimilarConcepts,
    quickSearch,

    // Concepts
    listConcepts,
    getConcept,
    saveConcept,
    deleteConcept,
    sendToArtisans,

    // Gallery
    getGallery,
    getGalleryItem,
    toggleFavorite,
    getRelatedItems,

    // Artisans
    getArtisanMatches,
    respondToMatch,
    getSellerMatches,

    // Schema
    getCategories,
    getMaterials,
    getStyles,

    // Session
    session: sessionUtils,
};

export default aiVisionApi;
