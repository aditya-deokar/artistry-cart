
import { Prisma } from '@prisma/client';
import { productGenModel } from '../../config/gemini';
import { safeParseLLMResponse, GeneratedProductSchema, GeneratedProductData } from '../../validators/schemas';
import { withRetry } from '../../utils/retry';
import { logger } from '../../utils/logger';
import prisma from '../../config/database';

export interface ProductGenerationResult {
    success: boolean;
    data: GeneratedProductData | null;
    error?: string;
}

/**
 * Generate structured product data from LLM based on concept analysis
 */
export async function generateProductData(
    conceptId: string,
    userPrompt: string,
    analyzedFeatures: Record<string, unknown>,
    primaryImageUrl?: string
): Promise<ProductGenerationResult> {
    const siteConfig = await prisma.site_config.findFirst();
    const categories = siteConfig?.categories || ['Home Decor', 'Clothing', 'Jewelry', 'Art'];
    const subCategories = (siteConfig?.subCategories as Record<string, string[]>) || {};

    try {
        const response = await withRetry(() => productGenModel.invoke([
            ['system', `You are a product analyst for Artistry Cart, an Indian handcraft marketplace.
Generate comprehensive product data as JSON for a handcrafted item.

Available categories: ${JSON.stringify(categories)}
${Object.keys(subCategories).length > 0 ? `Subcategories: ${JSON.stringify(subCategories)}` : ''}

Return a JSON object with exactly these fields:
{
  "title": "Product title (5-80 chars)",
  "description": "Short description (50-300 chars)",
  "detailedDescription": "Long description (200-1000 chars)",
  "category": "From available categories",
  "subCategory": "Specific subcategory",
  "tags": ["array", "of", "tags", "min 3", "max 15"],
  "colors": ["primary", "secondary colors"],
  "sizes": ["available sizes if applicable"],
  "materials": ["primary", "materials used"],
  "customSpecifications": {"key": "value pairs for specs"},
  "estimatedPriceMin": 500,
  "estimatedPriceMax": 2000,
  "priceConfidence": 0.8,
  "pricingRationale": "Why this price range",
  "requiredSkills": ["artisan", "skills needed"],
  "estimatedDuration": "2-3 days",
  "complexityLevel": "simple|moderate|complex|expert",
  "styleKeywords": ["style", "descriptors"],
  "designNotes": "Additional design notes",
  "feasibilityScore": 85,
  "feasibilityNotes": "Notes on production feasibility"
}

Prices should be in INR. Return ONLY valid JSON, no markdown.`],
            ['human', `Generate product data for:
Request: "${userPrompt}"
Analysis: ${JSON.stringify(analyzedFeatures)}
${primaryImageUrl ? `Image available at: ${primaryImageUrl}` : ''}`],
        ]), { maxRetries: 2 });

        const parseResult = await safeParseLLMResponse(
            response.content as string,
            GeneratedProductSchema
        );

        if (!parseResult.success) {
            logger.warn('Product data validation failed', {
                conceptId,
                error: parseResult.error
            });
            return { success: false, data: null, error: parseResult.error };
        }

        logger.info('Product data generated successfully', { conceptId });
        return { success: true, data: parseResult.data };

    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Product generation failed', { conceptId, error: errorMsg });
        return { success: false, data: null, error: errorMsg };
    }
}

/**
 * Save generated product data to database
 */
export async function saveGeneratedProduct(
    conceptId: string,
    productData: GeneratedProductData,
    promptUsed: string
) {
    return prisma.aIGeneratedProduct.create({
        data: {
            conceptId,
            title: productData.title,
            description: productData.description,
            detailedDescription: productData.detailedDescription,
            category: productData.category,
            subCategory: productData.subCategory,
            tags: productData.tags,
            colors: productData.colors,
            sizes: productData.sizes,
            materials: productData.materials,
            customSpecifications: (productData.customSpecifications || {}) as Prisma.InputJsonValue,
            estimatedPriceMin: productData.estimatedPriceMin,
            estimatedPriceMax: productData.estimatedPriceMax,
            priceConfidence: productData.priceConfidence,
            pricingRationale: productData.pricingRationale || '',
            requiredSkills: productData.requiredSkills,
            estimatedDuration: productData.estimatedDuration || '3-5 days',
            complexityLevel: productData.complexityLevel,
            styleKeywords: productData.styleKeywords,
            designNotes: productData.designNotes || '',
            feasibilityScore: productData.feasibilityScore ?? 75,
            feasibilityNotes: productData.feasibilityNotes || '',
            llmModel: 'gemini-2.5-pro',
            promptUsed,
            generationVersion: 1,
            isValidated: true,
            validationErrors: [],
        },
    });
}
