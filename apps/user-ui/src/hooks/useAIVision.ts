// ============================================
// AI VISION REACT HOOKS
// ============================================

import { useEffect, useCallback, useMemo, useState } from 'react';
import { useAIVisionStore } from '@/store/aivisionStore';
import { aiVisionApi } from '@/lib/api/aivision';
import type {
    TextToImageParams,
    ProductVariationParams,
    RefineConceptParams,
    GalleryParams,
    SendToArtisansParams,
    GalleryItemDetail,
    QuickSearchResult,
    SearchResult,
    VisualSearchParams,
    HybridSearchParams,
    GalleryItemData,
    ArtisanCardData,
    ArtisanMatch,
    GalleryItem,
    ConceptStatus,
} from '@/types/aivision';

// ============================================
// HOOK: useAIGeneration
// Main hook for AI image generation
// ============================================

export function useAIGeneration() {
    const {
        generation,
        setGenerationMode,
        generateFromText,
        generateVariation,
        refineConcept,
        clearGeneration,
        setGenerationError,
    } = useAIVisionStore();

    const generate = useCallback(async (
        mode: 'text' | 'variation' | 'refine',
        params: TextToImageParams | ProductVariationParams | RefineConceptParams
    ): Promise<boolean> => {
        switch (mode) {
            case 'text':
                return generateFromText(params as TextToImageParams);
            case 'variation':
                return generateVariation(params as ProductVariationParams);
            case 'refine':
                return refineConcept(params as RefineConceptParams);
            default:
                return false;
        }
    }, [generateFromText, generateVariation, refineConcept]);

    return {
        // State
        isGenerating: generation.isGenerating,
        progress: generation.progress,
        currentMode: generation.currentMode,
        concepts: generation.generatedConcepts,
        currentConceptId: generation.currentConceptId,
        error: generation.error,

        // Actions
        setMode: setGenerationMode,
        generate,
        generateFromText,
        generateVariation,
        refineConcept,
        clear: clearGeneration,
        setError: setGenerationError,

        // Computed
        hasResults: generation.generatedConcepts.length > 0,
    };
}

// ============================================
// HOOK: useConceptGallery
// Hook for browsing the public gallery
// ============================================

export function useConceptGallery(initialParams?: GalleryParams) {
    const {
        gallery,
        loadGallery,
        loadMoreGallery,
        setGalleryFilters,
        toggleFavorite,
    } = useAIVisionStore();

    // Memoize loadGallery with initial params
    const load = useCallback(() => {
        loadGallery(initialParams);
    }, [loadGallery, initialParams]);

    const refresh = useCallback(() => {
        loadGallery({ page: 1 });
    }, [loadGallery]);

    const hasMore = useMemo(() => {
        if (!gallery.pagination) return false;
        return gallery.pagination.page < gallery.pagination.pages;
    }, [gallery.pagination]);

    return {
        // State
        items: gallery.items,
        pagination: gallery.pagination,
        filters: gallery.filters,
        isLoading: gallery.isLoading,
        error: gallery.error,

        // Actions
        loadGallery: load,
        loadMore: loadMoreGallery,
        setFilters: setGalleryFilters,
        toggleFavorite,
        refresh,

        // Computed
        hasMore,
        isEmpty: gallery.items.length === 0 && !gallery.isLoading,
    };
}

// ============================================
// HOOK: useGalleryItem
// Hook for fetching single gallery item details
// ============================================

export function useGalleryItem(id: string | null) {
    const [item, setItem] = useState<GalleryItemDetail | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fetchId, setFetchId] = useState(0);

    const refetch = useCallback(() => {
        setFetchId(prev => prev + 1);
    }, []);

    useEffect(() => {
        if (!id) {
            setItem(null);
            return;
        }

        const itemId = id; // Capture validated id for closure
        let cancelled = false;

        async function fetchItem() {
            setIsLoading(true);
            setError(null);

            try {
                const response = await aiVisionApi.getGalleryItem(itemId);

                if (cancelled) return;

                if (response.success && response.data) {
                    setItem(response.data);
                } else {
                    setError(response.error?.message || 'Failed to load item');
                }
            } catch (err: unknown) {
                if (!cancelled) {
                    const errorMessage = err instanceof Error ? err.message : 'Failed to load item';
                    setError(errorMessage);
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        fetchItem();

        return () => {
            cancelled = true;
        };
    }, [id, fetchId]);

    return { item, isLoading, error, refetch };
}

// ============================================
// HOOK: useArtisanMatching
// Hook for artisan matching workflow
// ============================================

export function useArtisanMatching(conceptId: string | null) {
    const {
        artisans,
        loadArtisanMatches,
        toggleArtisanSelection,
        selectAllArtisans,
        clearArtisanSelection,
        sendToArtisans,
    } = useAIVisionStore();

    useEffect(() => {
        if (conceptId && artisans.matches.length === 0 && !artisans.isLoading) {
            loadArtisanMatches(conceptId);
        }
    }, [conceptId]);

    const send = useCallback(async (
        params: Omit<SendToArtisansParams, 'artisanIds'>
    ): Promise<boolean> => {
        if (!conceptId) return false;
        return sendToArtisans(conceptId, params);
    }, [conceptId, sendToArtisans]);

    const reload = useCallback(() => {
        if (conceptId) {
            loadArtisanMatches(conceptId);
        }
    }, [conceptId, loadArtisanMatches]);

    return {
        // State
        matches: artisans.matches,
        selectedIds: artisans.selectedIds,
        isLoading: artisans.isLoading,
        isSending: artisans.isSending,
        error: artisans.error,

        // Actions
        toggleSelection: toggleArtisanSelection,
        selectAll: selectAllArtisans,
        clearSelection: clearArtisanSelection,
        send,
        reload,

        // Computed
        selectedCount: artisans.selectedIds.length,
        hasSelection: artisans.selectedIds.length > 0,
    };
}

// ============================================
// HOOK: useSchemaData
// Hook for getting schema/metadata
// ============================================

export function useSchemaData() {
    const { schema, loadSchema } = useAIVisionStore();

    useEffect(() => {
        if (!schema.isLoaded) {
            loadSchema();
        }
    }, [schema.isLoaded, loadSchema]);

    return {
        categories: schema.categories,
        subCategories: schema.subCategories,
        materials: schema.materials,
        styles: schema.styles,
        isLoaded: schema.isLoaded,
    };
}

// ============================================
// HOOK: useSavedConcepts
// Hook for managing user's saved concepts
// ============================================

export function useSavedConcepts() {
    const {
        userConcepts,
        loadSavedConcepts,
        saveConcept,
        deleteConcept,
    } = useAIVisionStore();

    useEffect(() => {
        if (userConcepts.savedConcepts.length === 0 && !userConcepts.isLoading) {
            loadSavedConcepts();
        }
    }, []);

    return {
        concepts: userConcepts.savedConcepts,
        isLoading: userConcepts.isLoading,
        error: userConcepts.error,
        save: saveConcept,
        remove: deleteConcept,
        refresh: loadSavedConcepts,
    };
}

// ============================================
// HOOK: useProductSearch
// Hook for searching products (for variation mode)
// ============================================

export function useProductSearch() {
    const [results, setResults] = useState<QuickSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const search = useCallback(async (query: string, category?: string) => {
        if (!query || query.length < 2) {
            setResults([]);
            return;
        }

        setIsSearching(true);
        setError(null);

        try {
            const response = await aiVisionApi.quickSearch(query, 10, category);

            if (response.success && response.data) {
                setResults(response.data.results);
            } else {
                setError(response.error?.message || 'Search failed');
                setResults([]);
            }
        } catch (err: any) {
            setError(err.message || 'Search failed');
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const clear = useCallback(() => {
        setResults([]);
        setError(null);
    }, []);

    return { results, isSearching, error, search, clear };
}

// ============================================
// HOOK: useVisualSearch
// Hook for visual/image-based search
// ============================================

export function useVisualSearch() {
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchByImage = useCallback(async (params: VisualSearchParams) => {
        setIsSearching(true);
        setError(null);

        try {
            const response = await aiVisionApi.visualSearch(params);

            if (response.success && response.data) {
                setResults(response.data.results);
            } else {
                setError(response.error?.message || 'Visual search failed');
                setResults([]);
            }
        } catch (err: any) {
            setError(err.message || 'Visual search failed');
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const hybridSearch = useCallback(async (params: HybridSearchParams) => {
        setIsSearching(true);
        setError(null);

        try {
            const response = await aiVisionApi.hybridSearch(params);

            if (response.success && response.data) {
                setResults(response.data.results);
            } else {
                setError(response.error?.message || 'Hybrid search failed');
                setResults([]);
            }
        } catch (err: any) {
            setError(err.message || 'Hybrid search failed');
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const clear = useCallback(() => {
        setResults([]);
        setError(null);
    }, []);

    return { results, isSearching, error, searchByImage, hybridSearch, clear };
}

// ============================================
// HOOK: useConceptActions
// Hook for concept-level actions (save, refine, etc.)
// ============================================

export function useConceptActions() {
    const { saveConcept } = useAIVisionStore();
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const handleSave = useCallback(async (id: string, title?: string): Promise<boolean> => {
        setActionLoading('save');
        try {
            const result = await saveConcept(id, title);
            return result;
        } finally {
            setActionLoading(null);
        }
    }, [saveConcept]);

    const handleFindSimilar = useCallback(async (imageUrl: string) => {
        setActionLoading('similar');
        try {
            const response = await aiVisionApi.findSimilarConcepts(imageUrl);
            return response.success ? response.data?.concepts || [] : [];
        } finally {
            setActionLoading(null);
        }
    }, []);

    return {
        save: handleSave,
        findSimilar: handleFindSimilar,
        isLoading: actionLoading !== null,
        loadingAction: actionLoading,
    };
}

// ============================================
// ADAPTER FUNCTIONS
// Transform API data to component-friendly formats
// ============================================

/**
 * Transform GalleryItem to GalleryItemData (for existing component interface)
 */
export function adaptGalleryItem(item: GalleryItem): GalleryItemData {
    const statusMap: Record<ConceptStatus, 'realized' | 'in-progress' | 'awaiting'> = {
        GENERATING: 'awaiting',
        GENERATED: 'awaiting',
        SAVED: 'awaiting',
        SENT_TO_ARTISANS: 'in-progress',
        IN_PROGRESS: 'in-progress',
        REALIZED: 'realized',
        FAILED: 'awaiting',
    };

    // Determine aspect ratio from image dimensions (or default)
    const aspectRatio: 'portrait' | 'landscape' | 'square' = 'square';

    return {
        id: item.id,
        imageUrl: item.imageUrl || item.thumbnailUrl,
        category: item.category,
        title: item.title,
        author: undefined, // Not available in current API
        likes: 0, // Not available in current API
        views: item.viewCount,
        status: statusMap[item.status] || 'awaiting',
        prompt: '', // Would need to fetch full item for this
        aspectRatio,
        priceRange: item.priceRange || undefined,
        materials: item.materials,
    };
}

/**
 * Transform ArtisanMatch to ArtisanCardData (for existing component interface)
 */
export function adaptArtisanMatch(match: ArtisanMatch): ArtisanCardData {
    return {
        id: match.id,
        sellerId: match.sellerId,
        name: match.shop?.name || 'Unknown Artisan',
        studio: match.shop?.name || '',
        location: '', // Not available in current API
        rating: match.shop?.rating || 0,
        reviewCount: 0, // Not available in current API
        specialties: [match.shop?.category || 'General'].filter(Boolean),
        responseTime: 'Typically 24h', // Default
        priceRange: match.quote ? `$${match.quote.price}` : 'Contact for quote',
        avatar: match.shop?.avatar || '🗿',
        portfolio: [], // Not available in current API
        matchScore: match.overallScore,
        matchReasons: match.matchReasons,
        status: match.status,
    };
}

// ============================================
// EXPORT ALL HOOKS
// ============================================

export {
    useAIVisionStore,
    useGenerationState,
    useGalleryState,
    useArtisanState,
    useUserConceptsState,
    useSchemaState,
} from '@/store/aivisionStore';
