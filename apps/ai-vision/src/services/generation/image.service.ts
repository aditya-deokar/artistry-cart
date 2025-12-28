import { getImageModel } from '../../config/gemini';
import { uploadConceptImage, deleteImage } from '../../config/imagekit';
import { withRetry } from '../../utils/retry';
import { logger } from '../../utils/logger';

export interface GeneratedImage {
    url: string;
    thumbnailUrl: string;
    fileId: string;
    filePath: string;
}

export interface GenerationResult {
    images: GeneratedImage[];
    failedCount: number;
    errors: string[];
}

/**
 * Generate concept images using Gemini's image generation
 */
export async function generateConceptImages(
    prompt: string,
    conceptId: string,
    count: number = 4
): Promise<GenerationResult> {
    const result: GenerationResult = {
        images: [],
        failedCount: 0,
        errors: [],
    };

    const model = getImageModel();

    // Generate images sequentially to avoid rate limits
    for (let i = 0; i < count; i++) {
        try {
            logger.info(`Generating image ${i + 1}/${count}`, { conceptId });

            const image = await withRetry(async () => {
                const response = await model.generateContent({
                    contents: [{
                        role: 'user',
                        parts: [{ text: prompt }],
                    }],
                    generationConfig: {
                        responseModalities: ['image', 'text'],
                    } as any, // Type assertion for image modality
                });

                const candidate = response.response.candidates?.[0];
                if (!candidate?.content?.parts) {
                    throw new Error('No content in response');
                }

                // Look for inline image data
                for (const part of candidate.content.parts) {
                    if (part.inlineData?.data) {
                        // Upload to ImageKit
                        return await uploadConceptImage(
                            part.inlineData.data,
                            part.inlineData.mimeType || 'image/png',
                            conceptId,
                            i
                        );
                    }
                }

                throw new Error('No image generated in response');
            }, { maxRetries: 2, delayMs: 2000 });

            result.images.push(image);

            // Small delay between requests to avoid rate limiting
            if (i < count - 1) {
                await new Promise(r => setTimeout(r, 1000));
            }

        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            logger.error(`Image ${i + 1} generation failed`, { conceptId, error: errorMsg });
            result.failedCount++;
            result.errors.push(`Image ${i + 1}: ${errorMsg}`);
        }
    }

    logger.info('Image generation batch complete', {
        conceptId,
        success: result.images.length,
        failed: result.failedCount,
    });

    return result;
}

/**
 * Generate a single test image (for testing purposes)
 */
export async function generateTestImage(prompt: string): Promise<{
    success: boolean;
    base64?: string;
    mimeType?: string;
    error?: string;
}> {
    try {
        const model = getImageModel();

        const response = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [{ text: prompt }],
            }],
            generationConfig: {
                responseModalities: ['image', 'text'],
            } as any,
        });

        const candidate = response.response.candidates?.[0];
        if (!candidate?.content?.parts) {
            return { success: false, error: 'No content in response' };
        }

        for (const part of candidate.content.parts) {
            if (part.inlineData?.data) {
                return {
                    success: true,
                    base64: part.inlineData.data,
                    mimeType: part.inlineData.mimeType || 'image/png',
                };
            }
        }

        return { success: false, error: 'No image in response' };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Cleanup images for a failed concept
 */
export async function cleanupConceptImages(images: GeneratedImage[]): Promise<void> {
    for (const image of images) {
        await deleteImage(image.fileId);
    }
}
