import { StateGraph, START, END } from '@langchain/langgraph';
import { analysisModel, creativeModel } from '../config/gemini';
import { generateConceptImages, GeneratedImage } from '../services/generation/image.service';
import { logger } from '../utils/logger';
import { GeneratedProductData } from '../validators/schemas';
import { generateProductData, saveGeneratedProduct } from '../services/generation/product.service';

// ============================================
// STATE INTERFACE (Simple approach)
// ============================================

interface ConceptState {
    // Input
    userPrompt: string;
    mode: 'text' | 'variation' | 'visual';
    conceptId: string;
    sessionId: string;
    category?: string;
    style?: string;
    material?: string;
    referenceImageUrl?: string;
    imageCount: number;

    // Processing
    analyzedIntent: Record<string, unknown> | null;
    enhancedPrompt: string | null;

    // Results
    generatedImages: GeneratedImage[];
    imageErrors: string[];
    generatedProduct: GeneratedProductData | null;

    // Status
    error: string | null;
    status: 'processing' | 'partial_success' | 'success' | 'failed';
}

// ============================================
// NODE FUNCTIONS
// ============================================

async function analyzeIntent(state: ConceptState): Promise<Partial<ConceptState>> {
    logger.info('Analyzing user intent', { conceptId: state.conceptId });

    try {
        const response = await analysisModel.invoke([
            ['system', `You are a product analyst for Artistry Cart, an Indian handcraft marketplace.
Analyze the request and extract structured information as JSON:
{
  "category": "detected product category",
  "subcategory": "specific type",
  "styleKeywords": ["style", "keywords"],
  "materials": ["likely", "materials"],
  "colors": ["color", "preferences"],
  "sizeHints": "any size/dimension mentions",
  "targetAudience": "who this is for",
  "priceRange": "budget indicators if any",
  "artisanSkills": ["required", "skills"],
  "confidence": 0.0-1.0
}
Return ONLY valid JSON.`],
            ['human', `Analyze this request:
"${state.userPrompt}"
${state.category ? `Category hint: ${state.category}` : ''}
${state.style ? `Style hint: ${state.style}` : ''}
${state.material ? `Material hint: ${state.material}` : ''}`],
        ]);

        const content = response.content as string;
        const jsonMatch = content.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                return { analyzedIntent: parsed };
            } catch {
                return { analyzedIntent: { raw: content, category: state.category } };
            }
        }

        return { analyzedIntent: { raw: content } };
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Analysis failed';
        logger.error('Intent analysis failed', { conceptId: state.conceptId, error: errorMsg });
        // Don't fail the entire workflow - continue with basic intent
        return {
            analyzedIntent: {
                category: state.category || 'handcraft',
                styleKeywords: state.style ? [state.style] : [],
                materials: state.material ? [state.material] : [],
            }
        };
    }
}

async function enhancePrompt(state: ConceptState): Promise<Partial<ConceptState>> {
    if (state.error) return {};

    logger.info('Enhancing prompt', { conceptId: state.conceptId });

    try {
        const response = await creativeModel.invoke([
            ['system', `You are an expert at creating detailed image prompts for AI image generation.
Create a vivid, detailed prompt for generating product photography of Indian handcrafted items.

Include:
- Professional studio lighting setup
- Material textures and finishes
- Color palette (be specific)
- Product angles and composition
- Background/setting suggestions
- Artistic style references

Keep under 200 words. Return ONLY the prompt text, no explanation.`],
            ['human', `Original request: "${state.userPrompt}"
Analysis: ${JSON.stringify(state.analyzedIntent)}
Create a detailed image generation prompt.`],
        ]);

        return {
            enhancedPrompt: response.content as string,
        };
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Enhancement failed';
        logger.error('Prompt enhancement failed', { conceptId: state.conceptId, error: errorMsg });
        // Fallback to original prompt
        return {
            enhancedPrompt: `Professional product photography of ${state.userPrompt}, studio lighting, white background, high resolution`,
        };
    }
}

async function generateImages(state: ConceptState): Promise<Partial<ConceptState>> {
    if (state.error || !state.enhancedPrompt) {
        return { status: 'failed', error: 'No prompt available for image generation' };
    }

    logger.info('Generating images', { conceptId: state.conceptId, count: state.imageCount });

    try {
        const result = await generateConceptImages(
            state.enhancedPrompt,
            state.conceptId,
            state.imageCount
        );

        if (result.images.length === 0) {
            return {
                generatedImages: [],
                imageErrors: result.errors,
                status: 'failed',
                error: 'No images could be generated',
            };
        }

        const status = result.failedCount > 0 ? 'partial_success' : 'success';

        return {
            generatedImages: result.images,
            imageErrors: result.errors,
            status,
        };
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Generation failed';
        logger.error('Image generation failed', { conceptId: state.conceptId, error: errorMsg });
        return {
            error: errorMsg,
            status: 'failed'
        };
    }
}

async function generateProduct(state: ConceptState): Promise<Partial<ConceptState>> {
    // Skip if no images or already failed
    if (state.generatedImages.length === 0 || state.status === 'failed') {
        return {};
    }

    logger.info('Generating product data', { conceptId: state.conceptId });

    try {
        const productResult = await generateProductData(
            state.conceptId,
            state.userPrompt,
            state.analyzedIntent || {},
            state.generatedImages[0]?.url
        );

        if (productResult.success && productResult.data) {
            await saveGeneratedProduct(
                state.conceptId,
                productResult.data,
                state.enhancedPrompt || state.userPrompt
            );
            return { generatedProduct: productResult.data };
        }

        logger.warn('Product generation returned no data', {
            conceptId: state.conceptId,
            error: productResult.error,
        });
        return {};
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Product gen failed';
        logger.error('Product generation failed', { conceptId: state.conceptId, error: errorMsg });
        // Don't fail entire workflow for product gen errors
        return {};
    }
}

// ============================================
// ROUTING LOGIC
// ============================================

function routeAfterImages(state: ConceptState): 'productGen' | '__end__' {
    if (state.error || state.generatedImages.length === 0) {
        return '__end__';
    }
    return 'productGen';
}

// ============================================
// BUILD GRAPH (using channels approach)
// ============================================

const graphBuilder = new StateGraph<ConceptState>({
    channels: {
        userPrompt: { value: (a: string, b?: string) => b ?? a, default: () => '' },
        mode: { value: (a: ConceptState['mode'], b?: ConceptState['mode']) => b ?? a, default: () => 'text' as const },
        conceptId: { value: (a: string, b?: string) => b ?? a, default: () => '' },
        sessionId: { value: (a: string, b?: string) => b ?? a, default: () => '' },
        category: { value: (a?: string, b?: string) => b ?? a, default: () => undefined },
        style: { value: (a?: string, b?: string) => b ?? a, default: () => undefined },
        material: { value: (a?: string, b?: string) => b ?? a, default: () => undefined },
        referenceImageUrl: { value: (a?: string, b?: string) => b ?? a, default: () => undefined },
        imageCount: { value: (a: number, b?: number) => b ?? a, default: () => 4 },
        analyzedIntent: { value: (a: ConceptState['analyzedIntent'], b?: ConceptState['analyzedIntent']) => b ?? a, default: () => null },
        enhancedPrompt: { value: (a: string | null, b?: string | null) => b ?? a, default: () => null },
        generatedImages: { value: (a: GeneratedImage[], b?: GeneratedImage[]) => b ?? a, default: () => [] },
        imageErrors: { value: (a: string[], b?: string[]) => b ?? a, default: () => [] },
        generatedProduct: { value: (a: GeneratedProductData | null, b?: GeneratedProductData | null) => b ?? a, default: () => null },
        error: { value: (a: string | null, b?: string | null) => b ?? a, default: () => null },
        status: { value: (a: ConceptState['status'], b?: ConceptState['status']) => b ?? a, default: () => 'processing' as const },
    },
})
    .addNode('analyze', analyzeIntent)
    .addNode('enhance', enhancePrompt)
    .addNode('generate', generateImages)
    .addNode('productGen', generateProduct)
    .addEdge(START, 'analyze')
    .addEdge('analyze', 'enhance')
    .addEdge('enhance', 'generate')
    .addConditionalEdges('generate', routeAfterImages, {
        productGen: 'productGen',
        __end__: END,
    })
    .addEdge('productGen', END);

// Compile the graph
export const conceptGeneratorGraph = graphBuilder.compile();

// ============================================
// PUBLIC API
// ============================================

export interface ConceptGenerationInput {
    prompt: string;
    conceptId: string;
    sessionId: string;
    mode?: 'text' | 'variation' | 'visual';
    category?: string;
    style?: string;
    material?: string;
    referenceImageUrl?: string;
    imageCount?: number;
}

export interface ConceptGenerationResult {
    success: boolean;
    conceptId: string;
    images: GeneratedImage[];
    imageErrors: string[];
    product: GeneratedProductData | null;
    enhancedPrompt: string | null;
    analyzedIntent: Record<string, unknown> | null;
    error?: string;
}

export async function generateConcept(input: ConceptGenerationInput): Promise<ConceptGenerationResult> {
    logger.info('Starting concept generation', {
        conceptId: input.conceptId,
        prompt: input.prompt.substring(0, 50),
    });

    const rawResult = await conceptGeneratorGraph.invoke({
        userPrompt: input.prompt,
        conceptId: input.conceptId,
        sessionId: input.sessionId,
        mode: input.mode || 'text',
        category: input.category,
        style: input.style,
        material: input.material,
        referenceImageUrl: input.referenceImageUrl,
        imageCount: input.imageCount || 4,
    });

    // Cast to ConceptState via unknown for LangGraph compatibility
    const result = rawResult as unknown as ConceptState;

    logger.info('Concept generation complete', {
        conceptId: input.conceptId,
        status: result.status,
        imageCount: result.generatedImages.length,
    });

    return {
        success: result.status !== 'failed',
        conceptId: input.conceptId,
        images: result.generatedImages,
        imageErrors: result.imageErrors,
        product: result.generatedProduct,
        enhancedPrompt: result.enhancedPrompt,
        analyzedIntent: result.analyzedIntent,
        error: result.error || undefined,
    };
}

export type { ConceptState, GeneratedImage };

