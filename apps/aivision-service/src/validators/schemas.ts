import { z, ZodSchema, ZodError } from 'zod';

// ============================================
// INPUT VALIDATION SCHEMAS
// ============================================

// Text-to-Image Generation
export const TextToImageSchema = z.object({
    prompt: z.string().min(3).max(1000),
    category: z.string().optional(),
    style: z.string().optional(),
    material: z.string().optional(),
    count: z.number().min(1).max(8).default(4),
});

// Product Variation
export const ProductVariationSchema = z.object({
    productId: z.string().min(1),
    modifications: z.string().min(3).max(500),
    adjustments: z.object({
        color: z.array(z.string()).optional(),
        size: z.any().optional(),
        material: z.array(z.string()).optional(),
        style: z.string().optional(),
    }).optional(),
    count: z.number().min(1).max(8).default(4),
});

// From Image Generation
export const FromImageSchema = z.object({
    imageUrl: z.string().url().optional(),
    imageBase64: z.string().optional(),
    prompt: z.string().min(3).max(500).optional(),
    count: z.number().min(1).max(8).default(4),
});

// Refine Concept
export const RefineConceptSchema = z.object({
    conceptId: z.string().min(1),
    adjustments: z.string().min(3).max(500),
    preserveElements: z.array(z.string()).optional(),
});

// Visual Search
export const VisualSearchSchema = z.object({
    imageUrl: z.string().url().optional(),
    imageBase64: z.string().optional(),
    filters: z.object({
        category: z.array(z.string()).optional(),
        priceRange: z.object({
            min: z.number().optional(),
            max: z.number().optional(),
        }).optional(),
        inStock: z.boolean().optional(),
        artisanId: z.string().optional(),
    }).optional(),
    threshold: z.number().min(0).max(1).default(0.7),
    limit: z.number().min(1).max(50).default(20),
});

// Hybrid Search
export const HybridSearchSchema = z.object({
    query: z.string().optional(),
    imageUrl: z.string().url().optional(),
    weights: z.object({
        text: z.number().min(0).max(1),
        visual: z.number().min(0).max(1),
    }).optional(),
    filters: z.object({
        category: z.array(z.string()).optional(),
        priceRange: z.object({
            min: z.number().optional(),
            max: z.number().optional(),
        }).optional(),
        inStock: z.boolean().optional(),
    }).optional(),
    limit: z.number().min(1).max(50).default(20),
});

// Save Concept
export const SaveConceptSchema = z.object({
    title: z.string().max(100).optional(),
});

// Send to Artisans
export const SendToArtisansSchema = z.object({
    artisanIds: z.array(z.string()).min(1).max(10),
    message: z.string().max(1000).optional(),
    budget: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
    }).optional(),
    deadline: z.string().optional(),
});

// Artisan Response
export const ArtisanResponseSchema = z.object({
    matchId: z.string().min(1),
    response: z.enum(['INTERESTED', 'QUOTED', 'DECLINED']),
    message: z.string().max(1000).optional(),
    quote: z.object({
        price: z.number().positive(),
        timeline: z.string(),
    }).optional(),
});

// ============================================
// LLM OUTPUT VALIDATION SCHEMAS
// ============================================

export const GeneratedProductSchema = z.object({
    title: z.string().min(5).max(80),
    description: z.string().min(50).max(300),
    detailedDescription: z.string().min(200).max(1000),
    category: z.string(),
    subCategory: z.string(),
    tags: z.array(z.string()).min(3).max(15),
    colors: z.array(z.string()),
    sizes: z.array(z.string()).default([]),
    materials: z.array(z.string()).min(1),
    customSpecifications: z.record(z.string(), z.any()).optional(),
    estimatedPriceMin: z.number().positive(),
    estimatedPriceMax: z.number().positive(),
    priceConfidence: z.number().min(0).max(1),
    pricingRationale: z.string().optional(),
    requiredSkills: z.array(z.string()),
    estimatedDuration: z.string().optional(),
    complexityLevel: z.enum(['simple', 'moderate', 'complex', 'expert']),
    styleKeywords: z.array(z.string()),
    designNotes: z.string().optional(),
    feasibilityScore: z.number().min(0).max(100).optional(),
    feasibilityNotes: z.string().optional(),
});

export type GeneratedProductData = z.infer<typeof GeneratedProductSchema>;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Safely parse LLM response with validation
 */
export async function safeParseLLMResponse<T>(
    response: string,
    schema: ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
    try {
        // Try to extract JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return { success: false, error: 'No JSON found in response' };
        }

        const parsed = JSON.parse(jsonMatch[0]);
        const validated = schema.parse(parsed);

        return { success: true, data: validated };
    } catch (error) {
        if (error instanceof ZodError) {
            return {
                success: false,
                error: `Validation: ${error.issues.map((e: z.ZodIssue) => e.message).join(', ')}`,
            };
        }
        if (error instanceof SyntaxError) {
            return { success: false, error: 'Invalid JSON in response' };
        }
        return { success: false, error: 'Failed to parse response' };
    }
}
