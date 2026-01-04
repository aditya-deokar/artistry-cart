import axios, { AxiosInstance, AxiosError } from 'axios';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────

export interface AIVisionSession {
  sessionId: string;
  token: string;
  createdAt: string;
}

export interface GenerateFromPromptRequest {
  prompt: string;
  category?: string;
  subCategory?: string;
  style?: string;
  materials?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  sessionToken?: string;
}

export interface GenerateProductVariationRequest {
  productId: string;
  variationPrompt: string;
  modifyColor?: boolean;
  modifyMaterial?: boolean;
  modifyStyle?: boolean;
  sessionToken?: string;
}

export interface VisualSearchRequest {
  imageUrl?: string;
  imageBase64?: string;
  searchMode: 'similar' | 'variations';
  filters?: {
    category?: string;
    priceRange?: { min: number; max: number };
  };
}

export interface RefineConceptRequest {
  conceptId: string;
  refinementPrompt: string;
  adjustments?: {
    style?: string;
    materials?: string[];
    colors?: string[];
  };
}

export interface Concept {
  id: string;
  sessionId: string;
  generationPrompt: string;
  enhancedPrompt: string;
  primaryImageUrl: string;
  thumbnailUrl: string;
  images: string[];
  analyzedFeatures: Record<string, any>;
  status: 'GENERATED' | 'SAVED' | 'SENT_TO_ARTISANS' | 'REALIZED';
  isSaved: boolean;
  isFavorite: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  generatedProduct?: GeneratedProduct;
}

export interface GeneratedProduct {
  title: string;
  description: string;
  category: string;
  subCategory?: string;
  materials: string[];
  colors: string[];
  sizes: string[];
  tags: string[];
  estimatedPriceMin: number;
  estimatedPriceMax: number;
  priceConfidence: number;
  complexityLevel: string;
  estimatedDuration: string;
  feasibilityScore: number;
  styleKeywords: string[];
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  category: string;
  title: string;
  description: string;
  viewCount: number;
  favoriteCount: number;
  status: string;
  isFavorite: boolean;
  createdAt: string;
  generatedProduct?: GeneratedProduct;
}

export interface ArtisanMatch {
  artisanId: string;
  artisanName: string;
  profileImage: string;
  businessName: string;
  specialties: string[];
  matchScore: number;
  matchReasons: string[];
  skillMatchScore: number;
  priceMatchScore: number;
  styleMatchScore: number;
  availabilityScore: number;
  estimatedPrice?: { min: number; max: number };
  estimatedDelivery?: string;
  rating: number;
  reviewCount: number;
  completedOrders: number;
  responseTime: string;
  location: string;
}

export interface SchemaData {
  categories: Array<{ value: string; label: string; subcategories: string[] }>;
  materials: string[];
  styles: string[];
}

// ─── API Client Configuration ──────────────────────────────────────────────

const AI_VISION_BASE_URL = process.env.NEXT_PUBLIC_AI_VISION_API_URL || 'http://localhost:8080/ai-vision/api/v1/ai';

class AIVisionClient {
  private client: AxiosInstance;
  private sessionToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: AI_VISION_BASE_URL,
      timeout: 60000, // 60s for AI generation
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load session token from localStorage
    if (typeof window !== 'undefined') {
      this.sessionToken = localStorage.getItem('ai_vision_session_token');
    }

    // Request interceptor to add session token
    this.client.interceptors.request.use(
      (config) => {
        if (this.sessionToken) {
          config.headers['x-session-token'] = this.sessionToken;
        }
        // Add auth token if available
        const authToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (authToken) {
          config.headers['Authorization'] = `Bearer ${authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<{ message?: string; error?: string; details?: any }>) => {
        // Log detailed error for debugging
        if (error.response) {
          console.error('API Error:', {
            status: error.response.status,
            url: error.config?.url,
            method: error.config?.method,
            data: error.response.data,
          });
        }
        
        const message = error.response?.data?.message || error.response?.data?.error || 'An error occurred';
        
        if (error.response?.status === 429) {
          toast.error('Rate limit exceeded. Please try again in a moment.');
        } else if (error.response?.status === 401) {
          toast.error('Please sign in to continue');
        } else if (error.response?.status === 422) {
          // Validation errors - don't show toast, let component handle it
          console.warn('Validation error:', error.response.data);
        } else if (error.response?.status === 500) {
          toast.error('Server error. Our team has been notified.');
        } else if (error.response?.status !== 404) {
          // Don't show toast for 404s, let components handle
          toast.error(message);
        }
        
        return Promise.reject(error);
      }
    );
  }

  // ─── Session Management ──────────────────────────────────────────────────

  setSessionToken(token: string) {
    this.sessionToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai_vision_session_token', token);
    }
  }

  getSessionToken(): string | null {
    return this.sessionToken;
  }

  clearSession() {
    this.sessionToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ai_vision_session_token');
    }
  }

  // ─── Generation APIs ─────────────────────────────────────────────────────

  async generateFromPrompt(data: GenerateFromPromptRequest): Promise<Concept[]> {
    try {
      // Validate prompt length
      if (!data.prompt || data.prompt.trim().length < 3) {
        throw new Error('Prompt must be at least 3 characters long');
      }
      if (data.prompt.length > 1000) {
        throw new Error('Prompt must be less than 1000 characters');
      }
      
      // Build request body matching backend validation schema
      const requestBody: any = {
        prompt: data.prompt.trim(),
        count: 4, // Must be number between 1-8
      };
      
      // Add optional fields only if they have values
      if (data.category) requestBody.category = data.category;
      if (data.style) requestBody.style = data.style;
      if (data.materials && data.materials.length > 0) {
        requestBody.material = data.materials[0]; // Backend expects single material string
      }
      
      console.log('Sending text-to-image request:', requestBody);
      
      const response = await this.client.post('/generate/text-to-image', requestBody);
      
      console.log('Text-to-image response:', response.data);
      
      // Backend returns { success, data: { conceptId, images, product, ... } }
      const result = response.data;
      
      if (!result.success || !result.data) {
        console.error('Invalid response structure:', result);
        throw new Error(result.error?.message || 'Failed to generate concept');
      }
      
      // Store session token if provided
      if (result.data.sessionToken) {
        this.setSessionToken(result.data.sessionToken);
      }
      
      // Create a concept object from the response
      const concept: Concept = {
        id: result.data.conceptId,
        sessionId: result.data.sessionId || '',
        generationPrompt: data.prompt,
        enhancedPrompt: result.data.enhancedPrompt || data.prompt,
        primaryImageUrl: result.data.images?.[0]?.url || '',
        thumbnailUrl: result.data.images?.[0]?.thumbnailUrl || result.data.images?.[0]?.url || '',
        images: result.data.images || [],
        analyzedFeatures: result.data.analyzedIntent || {},
        generatedProduct: result.data.product ? {
          title: result.data.product.title || 'Untitled',
          description: result.data.product.description || '',
          category: result.data.product.category || data.category || 'Other',
          subCategory: result.data.product.subCategory,
          estimatedPriceMin: result.data.product.priceRange?.min || 0,
          estimatedPriceMax: result.data.product.priceRange?.max || 0,
          materials: result.data.product.materials || [],
          colors: result.data.product.colors || [],
          sizes: result.data.product.sizes || [],
          tags: result.data.product.tags || [],
          priceConfidence: result.data.product.priceConfidence || 0,
          complexityLevel: result.data.product.complexity || 'medium',
          estimatedDuration: result.data.product.estimatedDuration || '2-4 weeks',
          feasibilityScore: result.data.product.feasibilityScore || 0,
          styleKeywords: result.data.product.styleKeywords || [],
        } : undefined,
        isSaved: false,
        isFavorite: false,
        status: 'GENERATED',
        viewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return [concept];
    } catch (error: any) {
      console.error('Generation error:', error);
      
      // Extract detailed error message
      let errorMessage = 'Failed to generate concept';
      
      if (error.response?.data?.error) {
        const apiError = error.response.data.error;
        if (typeof apiError === 'string') {
          errorMessage = apiError;
        } else if (apiError.message) {
          errorMessage = apiError.message;
        } else if (apiError.details) {
          errorMessage = apiError.details;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  async generateProductVariation(data: GenerateProductVariationRequest): Promise<Concept[]> {
    const response = await this.client.post<{ concepts: Concept[] }>('/generate/product-variation', {
      ...data,
      sessionToken: this.sessionToken,
    });
    return response.data.concepts;
  }

  async refineConcept(data: RefineConceptRequest): Promise<Concept[]> {
    const response = await this.client.post<{ concepts: Concept[] }>('/generate/refine', data);
    return response.data.concepts;
  }

  // ─── Search APIs ─────────────────────────────────────────────────────────

  async visualSearch(data: VisualSearchRequest): Promise<{ results: GalleryItem[] }> {
    const response = await this.client.post<{ results: GalleryItem[] }>('/search/visual', data);
    return response.data;
  }

  async hybridSearch(query: string, filters?: any): Promise<{ results: GalleryItem[] }> {
    const response = await this.client.post<{ results: GalleryItem[] }>('/search/hybrid', {
      query,
      ...filters,
    });
    return response.data;
  }

  async findSimilar(conceptId: string): Promise<{ similar: GalleryItem[] }> {
    const response = await this.client.post<{ similar: GalleryItem[] }>('/search/similar', {
      conceptId,
    });
    return response.data;
  }

  async quickSearch(query: string): Promise<{ products: any[] }> {
    const response = await this.client.get<{ products: any[] }>('/search/quick', {
      params: { q: query },
    });
    return response.data;
  }

  // ─── Concept Management ──────────────────────────────────────────────────

  async getUserConcepts(filters?: {
    status?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }): Promise<{ concepts: Concept[]; total: number; page: number; totalPages: number }> {
    try {
      const response = await this.client.get('/concepts', { params: filters });
      
      // Backend returns { success, data: { concepts, total, limit, offset } }
      const result = response.data;
      if (result.success && result.data) {
        return {
          concepts: result.data.concepts || [],
          total: result.data.total || 0,
          page: filters?.page || 1,
          totalPages: Math.ceil((result.data.total || 0) / (filters?.limit || 20)),
        };
      }
      
      return { concepts: [], total: 0, page: 1, totalPages: 0 };
    } catch (error) {
      console.error('Failed to get user concepts:', error);
      return { concepts: [], total: 0, page: 1, totalPages: 0 };
    }
  }

  async getConceptById(id: string): Promise<Concept> {
    const response = await this.client.get(`/concepts/${id}`);
    
    // Backend returns { success, data: { id, prompt, images, product, ... } }
    const result = response.data;
    if (result.success && result.data) {
      return result.data;
    }
    
    throw new Error('Concept not found');
  }

  async saveConcept(conceptId: string): Promise<Concept> {
    const response = await this.client.post(`/concepts/${conceptId}/save`);
    toast.success('Concept saved to your library');
    
    // Backend returns { success, data: { concept } }
    const result = response.data;
    if (result.success && result.data) {
      return result.data.concept || result.data;
    }
    
    throw new Error('Failed to save concept');
  }

  async deleteConcept(conceptId: string): Promise<void> {
    await this.client.delete(`/concepts/${conceptId}`);
    toast.success('Concept deleted');
  }

  async sendToArtisans(conceptId: string, artisanIds: string[]): Promise<void> {
    await this.client.post(`/concepts/${conceptId}/send-to-artisans`, { artisanIds });
    toast.success(`Concept sent to ${artisanIds.length} artisan${artisanIds.length > 1 ? 's' : ''}`);
  }

  // ─── Gallery APIs ────────────────────────────────────────────────────────

  async getGallery(filters?: {
    category?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: GalleryItem[]; total: number; page: number; totalPages: number }> {
    try {
      const response = await this.client.get('/gallery', { params: filters });
      
      // Backend returns { success, data: { items, pagination: { total, page, limit, pages } } }
      const result = response.data;
      if (result.success && result.data) {
        return {
          items: result.data.items || [],
          total: result.data.pagination?.total || 0,
          page: result.data.pagination?.page || 1,
          totalPages: result.data.pagination?.pages || 0,
        };
      }
      
      return { items: [], total: 0, page: 1, totalPages: 0 };
    } catch (error) {
      console.error('Failed to get gallery:', error);
      return { items: [], total: 0, page: 1, totalPages: 0 };
    }
  }

  async getGalleryItem(id: string): Promise<{ item: GalleryItem; related: GalleryItem[] }> {
    const response = await this.client.get(`/gallery/${id}`);
    return response.data;
  }

  async toggleFavorite(id: string): Promise<{ isFavorite: boolean }> {
    const response = await this.client.post(`/gallery/${id}/favorite`);
    
    // Backend returns { success, data: { isFavorite } }
    const result = response.data;
    if (result.success && result.data) {
      return { isFavorite: result.data.isFavorite };
    }
    
    return { isFavorite: false };
  }

  async getRelatedItems(id: string): Promise<{ related: GalleryItem[] }> {
    const response = await this.client.get(`/gallery/${id}/related`);
    return response.data;
  }

  // ─── Artisan Matching ────────────────────────────────────────────────────

  async getArtisanMatches(conceptId: string): Promise<{ matches: ArtisanMatch[] }> {
    const response = await this.client.get(`/artisans/match/${conceptId}`);
    
    // Backend returns { success, data: { matches } }
    const result = response.data;
    if (result.success && result.data) {
      return { matches: result.data.matches || [] };
    }
    
    return { matches: [] };
  }

  // ─── Schema APIs ─────────────────────────────────────────────────────────

  async getCategories(): Promise<Array<{ value: string; label: string; subcategories: string[] }>> {
    try {
      const response = await this.client.get('/schema/categories');
      
      // Backend returns { success, data: { categories, subCategories } }
      const result = response.data;
      if (result.success && result.data) {
        const categories = result.data.categories || [];
        const subCategories = result.data.subCategories || {};
        
        // Transform to expected format
        return categories.map((cat: string) => ({
          value: cat.toLowerCase().replace(/\s+/g, '-'),
          label: cat,
          subcategories: subCategories[cat] || [],
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Failed to get categories:', error);
      return [];
    }
  }

  async getMaterials(): Promise<string[]> {
    try {
      const response = await this.client.get('/schema/materials');
      
      // Backend returns { success, data: { materials } }
      const result = response.data;
      if (result.success && result.data) {
        return result.data.materials || [];
      }
      
      return [];
    } catch (error) {
      console.error('Failed to get materials:', error);
      return [];
    }
  }

  async getStyles(): Promise<string[]> {
    try {
      const response = await this.client.get('/schema/styles');
      
      // Backend returns { success, data: { styles } }
      const result = response.data;
      if (result.success && result.data) {
        return result.data.styles || [];
      }
      
      return [];
    } catch (error) {
      console.error('Failed to get styles:', error);
      return [];
    }
  }

  async getAllSchema(): Promise<SchemaData> {
    try {
      const [categories, materials, styles] = await Promise.all([
        this.getCategories(),
        this.getMaterials(),
        this.getStyles(),
      ]);
      return { categories, materials, styles };
    } catch (error) {
      console.error('Failed to load schema:', error);
      return { categories: [], materials: [], styles: [] };
    }
  }

  // ─── Collections ──────────────────────────────────────────────────────────

  async createCollection(data: {
    name: string;
    description?: string;
    isPublic?: boolean;
    conceptIds?: string[];
  }): Promise<any> {
    try {
      const response = await this.client.post('/collections', data);
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to create collection:', error);
      throw error;
    }
  }

  async listCollections(params?: { includeShared?: boolean }): Promise<any[]> {
    try {
      const response = await this.client.get('/collections', { params });
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to list collections:', error);
      return [];
    }
  }

  async getCollection(id: string): Promise<any> {
    try {
      const response = await this.client.get(`/collections/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get collection:', error);
      throw error;
    }
  }

  async updateCollection(
    id: string,
    data: {
      name?: string;
      description?: string;
      isPublic?: boolean;
      coverImage?: string;
      sortOrder?: number;
    }
  ): Promise<any> {
    try {
      const response = await this.client.put(`/collections/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Failed to update collection:', error);
      throw error;
    }
  }

  async deleteCollection(id: string): Promise<void> {
    try {
      await this.client.delete(`/collections/${id}`);
    } catch (error) {
      console.error('Failed to delete collection:', error);
      throw error;
    }
  }

  async addToCollection(collectionId: string, conceptIds: string[]): Promise<any> {
    try {
      const response = await this.client.post(`/collections/${collectionId}/concepts`, {
        conceptIds,
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to add to collection:', error);
      throw error;
    }
  }

  async removeFromCollection(collectionId: string, conceptId: string): Promise<any> {
    try {
      const response = await this.client.delete(
        `/collections/${collectionId}/concepts/${conceptId}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to remove from collection:', error);
      throw error;
    }
  }

  async inviteCollaborator(
    collectionId: string,
    userId: string,
    permission: 'view' | 'edit' | 'admin'
  ): Promise<any> {
    try {
      const response = await this.client.post(`/collections/${collectionId}/collaborators`, {
        userId,
        permission,
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to invite collaborator:', error);
      throw error;
    }
  }

  async removeCollaborator(collectionId: string, collaboratorId: string): Promise<void> {
    try {
      await this.client.delete(`/collections/${collectionId}/collaborators/${collaboratorId}`);
    } catch (error) {
      console.error('Failed to remove collaborator:', error);
      throw error;
    }
  }

  // ─── Comment Methods ───────────────────────────────────────────────────

  /**
   * Create a new comment on a concept
   */
  async createComment(data: {
    conceptId: string;
    content: string;
    parentId?: string;
  }): Promise<any> {
    try {
      const response = await this.client.post('/comments', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create comment:', error);
      throw error;
    }
  }

  /**
   * Get all comments for a concept (with nested replies)
   */
  async getConceptComments(conceptId: string, sortBy: 'recent' | 'oldest' = 'recent'): Promise<{
    comments: any[];
    total: number;
  }> {
    try {
      const response = await this.client.get(`/comments/concept/${conceptId}`, {
        params: { sortBy },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      throw error;
    }
  }

  /**
   * Get user's recent comments
   */
  async getUserComments(params?: {
    limit?: number;
    page?: number;
  }): Promise<any> {
    try {
      const response = await this.client.get('/comments/my-comments', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user comments:', error);
      throw error;
    }
  }

  /**
   * Update a comment
   */
  async updateComment(commentId: string, content: string): Promise<any> {
    try {
      const response = await this.client.put(`/comments/${commentId}`, { content });
      return response.data;
    } catch (error) {
      console.error('Failed to update comment:', error);
      throw error;
    }
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<void> {
    try {
      await this.client.delete(`/comments/${commentId}`);
    } catch (error) {
      console.error('Failed to delete comment:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const aiVisionClient = new AIVisionClient();

export default aiVisionClient;
