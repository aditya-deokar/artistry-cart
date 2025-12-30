// ============================================
// AI VISION ZUSTAND STORE
// ============================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { aiVisionApi } from '@/lib/api/aivision';
import type {
    ConceptCardData,
    GalleryItem,
    ArtisanMatch,
    ConceptSummary,
    PaginationInfo,
    TextToImageParams,
    ProductVariationParams,
    RefineConceptParams,
    GalleryParams,
    SendToArtisansParams,
    GeneratedImage,
} from '@/types/aivision';

// ============================================
// STATE TYPES
// ============================================

export type GenerationMode = 'text' | 'product-variation' | 'visual-search';

interface GenerationState {
    isGenerating: boolean;
    progress: number;
    currentMode: GenerationMode;
    generatedConcepts: ConceptCardData[];
    currentConceptId: string | null;
    sessionId: string | null;
    error: string | null;
}

interface GalleryState {
    items: GalleryItem[];
    pagination: PaginationInfo | null;
    filters: {
        category: string;
        sortBy: 'recent' | 'popular' | 'favorites';
    };
    isLoading: boolean;
    error: string | null;
}

interface ArtisanState {
    matches: ArtisanMatch[];
    selectedIds: string[];
    isLoading: boolean;
    isSending: boolean;
    error: string | null;
}

interface UserConceptsState {
    savedConcepts: ConceptSummary[];
    isLoading: boolean;
    error: string | null;
}

interface SchemaState {
    categories: string[];
    subCategories: Record<string, string[]>;
    materials: string[];
    styles: string[];
    isLoaded: boolean;
}

interface AIVisionState {
    // Generation
    generation: GenerationState;

    // Gallery
    gallery: GalleryState;

    // Artisans
    artisans: ArtisanState;

    // User Concepts
    userConcepts: UserConceptsState;

    // Schema/Metadata
    schema: SchemaState;

    // Actions - Generation
    setGenerationMode: (mode: GenerationMode) => void;
    generateFromText: (params: TextToImageParams) => Promise<boolean>;
    generateVariation: (params: ProductVariationParams) => Promise<boolean>;
    refineConcept: (params: RefineConceptParams) => Promise<boolean>;
    clearGeneration: () => void;
    setGenerationError: (error: string | null) => void;

    // Actions - Gallery
    loadGallery: (params?: GalleryParams) => Promise<void>;
    loadMoreGallery: () => Promise<void>;
    setGalleryFilters: (filters: Partial<GalleryState['filters']>) => void;
    toggleFavorite: (id: string) => Promise<void>;

    // Actions - Artisans
    loadArtisanMatches: (conceptId: string) => Promise<void>;
    toggleArtisanSelection: (id: string) => void;
    selectAllArtisans: () => void;
    clearArtisanSelection: () => void;
    sendToArtisans: (conceptId: string, params: Omit<SendToArtisansParams, 'artisanIds'>) => Promise<boolean>;

    // Actions - User Concepts
    loadSavedConcepts: () => Promise<void>;
    saveConcept: (id: string, title?: string) => Promise<boolean>;
    deleteConcept: (id: string) => Promise<boolean>;

    // Actions - Schema
    loadSchema: () => Promise<void>;

    // Utilities
    reset: () => void;
}

// ============================================
// INITIAL STATE
// ============================================

const initialGenerationState: GenerationState = {
    isGenerating: false,
    progress: 0,
    currentMode: 'text',
    generatedConcepts: [],
    currentConceptId: null,
    sessionId: null,
    error: null,
};

const initialGalleryState: GalleryState = {
    items: [],
    pagination: null,
    filters: {
        category: '',
        sortBy: 'recent',
    },
    isLoading: false,
    error: null,
};

const initialArtisanState: ArtisanState = {
    matches: [],
    selectedIds: [],
    isLoading: false,
    isSending: false,
    error: null,
};

const initialUserConceptsState: UserConceptsState = {
    savedConcepts: [],
    isLoading: false,
    error: null,
};

const initialSchemaState: SchemaState = {
    categories: [],
    subCategories: {},
    materials: [],
    styles: [],
    isLoaded: false,
};

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useAIVisionStore = create<AIVisionState>()(
    persist(
        (set, get) => ({
            // Initial states
            generation: initialGenerationState,
            gallery: initialGalleryState,
            artisans: initialArtisanState,
            userConcepts: initialUserConceptsState,
            schema: initialSchemaState,

            // ==========================================
            // GENERATION ACTIONS
            // ==========================================

            setGenerationMode: (mode) => {
                set({
                    generation: {
                        ...get().generation,
                        currentMode: mode,
                        generatedConcepts: [],
                        error: null,
                    },
                });
            },

            generateFromText: async (params) => {
                set({
                    generation: {
                        ...get().generation,
                        isGenerating: true,
                        progress: 10,
                        error: null,
                        generatedConcepts: [],
                    },
                });

                try {
                    // Simulate progress updates
                    const progressInterval = setInterval(() => {
                        const current = get().generation.progress;
                        if (current < 90) {
                            set({
                                generation: {
                                    ...get().generation,
                                    progress: current + 10,
                                },
                            });
                        }
                    }, 1000);

                    const response = await aiVisionApi.textToImage(params);

                    clearInterval(progressInterval);

                    if (!response.success || !response.data) {
                        set({
                            generation: {
                                ...get().generation,
                                isGenerating: false,
                                progress: 0,
                                error: response.error?.message || 'Generation failed',
                            },
                        });
                        return false;
                    }

                    const concepts = response.data.images.map((img: GeneratedImage, i: number) => ({
                        id: `${response.data!.conceptId}-${i}`,
                        imageUrl: img.url,
                        thumbnailUrl: img.thumbnailUrl,
                        title: response.data!.product?.title || `Concept ${i + 1}`,
                        description: response.data!.product?.description || '',
                        category: response.data!.product?.category || 'Uncategorized',
                        priceRange: response.data!.product?.priceRange,
                        materials: response.data!.product?.materials,
                        complexity: response.data!.product?.complexity as ConceptCardData['complexity'],
                    }));

                    set({
                        generation: {
                            ...get().generation,
                            isGenerating: false,
                            progress: 100,
                            generatedConcepts: concepts,
                            currentConceptId: response.data.conceptId,
                            sessionId: response.data.sessionId,
                        },
                    });

                    return true;
                } catch (error: unknown) {
                    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
                    set({
                        generation: {
                            ...get().generation,
                            isGenerating: false,
                            progress: 0,
                            error: errorMessage,
                        },
                    });
                    return false;
                }
            },

            generateVariation: async (params) => {
                set({
                    generation: {
                        ...get().generation,
                        isGenerating: true,
                        progress: 10,
                        error: null,
                        generatedConcepts: [],
                    },
                });

                try {
                    const progressInterval = setInterval(() => {
                        const current = get().generation.progress;
                        if (current < 90) {
                            set({
                                generation: {
                                    ...get().generation,
                                    progress: current + 10,
                                },
                            });
                        }
                    }, 1000);

                    const response = await aiVisionApi.productVariation(params);

                    clearInterval(progressInterval);

                    if (!response.success || !response.data) {
                        set({
                            generation: {
                                ...get().generation,
                                isGenerating: false,
                                progress: 0,
                                error: response.error?.message || 'Variation generation failed',
                            },
                        });
                        return false;
                    }

                    const concepts = response.data.images.map((img: GeneratedImage, i: number) => ({
                        id: `${response.data!.conceptId}-${i}`,
                        imageUrl: img.url,
                        thumbnailUrl: img.thumbnailUrl,
                        title: `Variation ${String.fromCharCode(65 + i)}`,
                        description: `Based on ${response.data!.baseProduct.title} - ${params.modifications}`,
                        category: response.data!.product?.category || 'Variation',
                        priceRange: response.data!.product?.priceRange,
                    }));

                    set({
                        generation: {
                            ...get().generation,
                            isGenerating: false,
                            progress: 100,
                            generatedConcepts: concepts,
                            currentConceptId: response.data.conceptId,
                            sessionId: response.data.sessionId,
                        },
                    });

                    return true;
                } catch (error: unknown) {
                    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
                    set({
                        generation: {
                            ...get().generation,
                            isGenerating: false,
                            progress: 0,
                            error: errorMessage,
                        },
                    });
                    return false;
                }
            },

            refineConcept: async (params) => {
                set({
                    generation: {
                        ...get().generation,
                        isGenerating: true,
                        progress: 10,
                        error: null,
                    },
                });

                try {
                    const progressInterval = setInterval(() => {
                        const current = get().generation.progress;
                        if (current < 90) {
                            set({
                                generation: {
                                    ...get().generation,
                                    progress: current + 10,
                                },
                            });
                        }
                    }, 1000);

                    const response = await aiVisionApi.refineConcept(params);

                    clearInterval(progressInterval);

                    if (!response.success || !response.data) {
                        set({
                            generation: {
                                ...get().generation,
                                isGenerating: false,
                                progress: 0,
                                error: response.error?.message || 'Refinement failed',
                            },
                        });
                        return false;
                    }

                    const concepts = response.data.images.map((img: GeneratedImage, i: number) => ({
                        id: `${response.data!.newConceptId}-${i}`,
                        imageUrl: img.url,
                        thumbnailUrl: img.thumbnailUrl,
                        title: response.data!.product?.title || `Refined Concept ${i + 1}`,
                        description: response.data!.adjustmentsApplied,
                        category: response.data!.product?.category || 'Refined',
                        priceRange: response.data!.product?.priceRange,
                    }));

                    set({
                        generation: {
                            ...get().generation,
                            isGenerating: false,
                            progress: 100,
                            generatedConcepts: concepts,
                            currentConceptId: response.data.newConceptId,
                        },
                    });

                    return true;
                } catch (error: unknown) {
                    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
                    set({
                        generation: {
                            ...get().generation,
                            isGenerating: false,
                            progress: 0,
                            error: errorMessage,
                        },
                    });
                    return false;
                }
            },

            clearGeneration: () => {
                set({ generation: { ...initialGenerationState } });
            },

            setGenerationError: (error) => {
                set({
                    generation: {
                        ...get().generation,
                        error,
                    },
                });
            },

            // ==========================================
            // GALLERY ACTIONS
            // ==========================================

            loadGallery: async (params) => {
                set({
                    gallery: {
                        ...get().gallery,
                        isLoading: true,
                        error: null,
                    },
                });

                try {
                    const { filters } = get().gallery;
                    const response = await aiVisionApi.getGallery({
                        page: params?.page || 1,
                        limit: params?.limit || 20,
                        category: params?.category || filters.category || undefined,
                        sortBy: params?.sortBy || filters.sortBy,
                    });

                    if (!response.success || !response.data) {
                        set({
                            gallery: {
                                ...get().gallery,
                                isLoading: false,
                                error: response.error?.message || 'Failed to load gallery',
                            },
                        });
                        return;
                    }

                    set({
                        gallery: {
                            ...get().gallery,
                            items: response.data.items,
                            pagination: response.data.pagination,
                            isLoading: false,
                        },
                    });
                } catch (error: unknown) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to load gallery';
                    set({
                        gallery: {
                            ...get().gallery,
                            isLoading: false,
                            error: errorMessage,
                        },
                    });
                }
            },

            loadMoreGallery: async () => {
                const { pagination, filters, isLoading } = get().gallery;

                if (isLoading || !pagination || pagination.page >= pagination.pages) {
                    return;
                }

                set({
                    gallery: {
                        ...get().gallery,
                        isLoading: true,
                    },
                });

                try {
                    const response = await aiVisionApi.getGallery({
                        page: pagination.page + 1,
                        limit: pagination.limit,
                        category: filters.category || undefined,
                        sortBy: filters.sortBy,
                    });

                    if (!response.success || !response.data) {
                        set({
                            gallery: {
                                ...get().gallery,
                                isLoading: false,
                            },
                        });
                        return;
                    }

                    set({
                        gallery: {
                            ...get().gallery,
                            items: [...get().gallery.items, ...response.data.items],
                            pagination: response.data.pagination,
                            isLoading: false,
                        },
                    });
                } catch {
                    set({
                        gallery: {
                            ...get().gallery,
                            isLoading: false,
                        },
                    });
                }
            },

            setGalleryFilters: (filters) => {
                set({
                    gallery: {
                        ...get().gallery,
                        filters: { ...get().gallery.filters, ...filters },
                    },
                });
                // Reload gallery with new filters
                get().loadGallery({ page: 1 });
            },

            toggleFavorite: async (id) => {
                try {
                    const response = await aiVisionApi.toggleFavorite(id);

                    if (response.success && response.data) {
                        set({
                            gallery: {
                                ...get().gallery,
                                items: get().gallery.items.map(item =>
                                    item.id === id ? { ...item, isFavorite: response.data!.isFavorite } : item
                                ),
                            },
                        });
                    }
                } catch (error) {
                    console.error('Failed to toggle favorite:', error);
                }
            },

            // ==========================================
            // ARTISAN ACTIONS
            // ==========================================

            loadArtisanMatches: async (conceptId) => {
                set({
                    artisans: {
                        ...get().artisans,
                        isLoading: true,
                        error: null,
                        matches: [],
                    },
                });

                try {
                    const response = await aiVisionApi.getArtisanMatches(conceptId);

                    if (!response.success || !response.data) {
                        set({
                            artisans: {
                                ...get().artisans,
                                isLoading: false,
                                error: response.error?.message || 'Failed to load artisan matches',
                            },
                        });
                        return;
                    }

                    set({
                        artisans: {
                            ...get().artisans,
                            matches: response.data.matches,
                            isLoading: false,
                        },
                    });
                } catch (error: unknown) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to load artisan matches';
                    set({
                        artisans: {
                            ...get().artisans,
                            isLoading: false,
                            error: errorMessage,
                        },
                    });
                }
            },

            toggleArtisanSelection: (id) => {
                const currentIds = get().artisans.selectedIds;
                const index = currentIds.indexOf(id);
                const newIds = index === -1
                    ? [...currentIds, id]
                    : currentIds.filter(existingId => existingId !== id);

                set({
                    artisans: {
                        ...get().artisans,
                        selectedIds: newIds,
                    },
                });
            },

            selectAllArtisans: () => {
                set({
                    artisans: {
                        ...get().artisans,
                        selectedIds: get().artisans.matches.map((m: ArtisanMatch) => m.sellerId),
                    },
                });
            },

            clearArtisanSelection: () => {
                set({
                    artisans: {
                        ...get().artisans,
                        selectedIds: [],
                    },
                });
            },

            sendToArtisans: async (conceptId, params) => {
                const { selectedIds } = get().artisans;

                if (selectedIds.length === 0) {
                    set({
                        artisans: {
                            ...get().artisans,
                            error: 'Please select at least one artisan',
                        },
                    });
                    return false;
                }

                set({
                    artisans: {
                        ...get().artisans,
                        isSending: true,
                        error: null,
                    },
                });

                try {
                    const response = await aiVisionApi.sendToArtisans(conceptId, {
                        artisanIds: selectedIds,
                        ...params,
                    });

                    if (!response.success) {
                        set({
                            artisans: {
                                ...get().artisans,
                                isSending: false,
                                error: response.error?.message || 'Failed to send to artisans',
                            },
                        });
                        return false;
                    }

                    set({
                        artisans: {
                            ...get().artisans,
                            isSending: false,
                            selectedIds: [],
                        },
                    });

                    return true;
                } catch (error: unknown) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to send to artisans';
                    set({
                        artisans: {
                            ...get().artisans,
                            isSending: false,
                            error: errorMessage,
                        },
                    });
                    return false;
                }
            },

            // ==========================================
            // USER CONCEPTS ACTIONS
            // ==========================================

            loadSavedConcepts: async () => {
                set({
                    userConcepts: {
                        ...get().userConcepts,
                        isLoading: true,
                        error: null,
                    },
                });

                try {
                    const response = await aiVisionApi.listConcepts({ saved: true });

                    if (!response.success || !response.data) {
                        set({
                            userConcepts: {
                                ...get().userConcepts,
                                isLoading: false,
                                error: response.error?.message || 'Failed to load saved concepts',
                            },
                        });
                        return;
                    }

                    set({
                        userConcepts: {
                            ...get().userConcepts,
                            savedConcepts: response.data.concepts,
                            isLoading: false,
                        },
                    });
                } catch (error: unknown) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to load saved concepts';
                    set({
                        userConcepts: {
                            ...get().userConcepts,
                            isLoading: false,
                            error: errorMessage,
                        },
                    });
                }
            },

            saveConcept: async (id, title) => {
                try {
                    const response = await aiVisionApi.saveConcept(id, { title });

                    if (!response.success) {
                        return false;
                    }

                    // Update the concept in generated concepts if present
                    set({
                        generation: {
                            ...get().generation,
                            generatedConcepts: get().generation.generatedConcepts.map((c: ConceptCardData) =>
                                c.id === id ? { ...c, isSaved: true } : c
                            ),
                        },
                    });

                    // Reload saved concepts
                    get().loadSavedConcepts();

                    return true;
                } catch {
                    return false;
                }
            },

            deleteConcept: async (id) => {
                try {
                    const response = await aiVisionApi.deleteConcept(id);

                    if (!response.success) {
                        return false;
                    }

                    set({
                        userConcepts: {
                            ...get().userConcepts,
                            savedConcepts: get().userConcepts.savedConcepts.filter(
                                (c: ConceptSummary) => c.id !== id
                            ),
                        },
                    });

                    return true;
                } catch {
                    return false;
                }
            },

            // ==========================================
            // SCHEMA ACTIONS
            // ==========================================

            loadSchema: async () => {
                if (get().schema.isLoaded) return;

                try {
                    const [categoriesRes, materialsRes, stylesRes] = await Promise.all([
                        aiVisionApi.getCategories(),
                        aiVisionApi.getMaterials(),
                        aiVisionApi.getStyles(),
                    ]);

                    const newSchema = { ...get().schema };

                    if (categoriesRes.success && categoriesRes.data) {
                        newSchema.categories = categoriesRes.data.categories;
                        newSchema.subCategories = categoriesRes.data.subCategories;
                    }
                    if (materialsRes.success && materialsRes.data) {
                        newSchema.materials = materialsRes.data.materials;
                    }
                    if (stylesRes.success && stylesRes.data) {
                        newSchema.styles = stylesRes.data.styles;
                    }
                    newSchema.isLoaded = true;

                    set({ schema: newSchema });
                } catch (error) {
                    console.error('Failed to load schema:', error);
                }
            },

            // ==========================================
            // UTILITIES
            // ==========================================

            reset: () => {
                set({
                    generation: { ...initialGenerationState },
                    gallery: { ...initialGalleryState },
                    artisans: { ...initialArtisanState },
                    userConcepts: { ...initialUserConceptsState },
                    // Don't reset schema as it's static data
                });
            },
        }),
        {
            name: 'ai-vision-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                // Only persist certain parts of the state
                schema: state.schema,
                // Don't persist generation/gallery state as it should be fresh
            }),
        }
    )
);

// ============================================
// SELECTOR HOOKS
// ============================================

export const useGenerationState = () => useAIVisionStore((state) => state.generation);
export const useGalleryState = () => useAIVisionStore((state) => state.gallery);
export const useArtisanState = () => useAIVisionStore((state) => state.artisans);
export const useUserConceptsState = () => useAIVisionStore((state) => state.userConcepts);
export const useSchemaState = () => useAIVisionStore((state) => state.schema);

export default useAIVisionStore;
