import ImageKit from 'imagekit';
import { config } from './index';
import { logger } from '../utils/logger';

// ============================================
// IMAGEKIT CLIENT
// ============================================

let imagekitClient: ImageKit | null = null;

export function getImageKit(): ImageKit {
    if (!imagekitClient) {
        imagekitClient = new ImageKit({
            publicKey: config.imagekit.publicKey,
            privateKey: config.imagekit.privateKey,
            urlEndpoint: config.imagekit.urlEndpoint,
        });
    }
    return imagekitClient;
}

// ============================================
// AI VISION FOLDER STRUCTURE
// ============================================

export const AI_VISION_FOLDER = '/ai-vision';

export interface UploadedImage {
    url: string;
    thumbnailUrl: string;
    fileId: string;
    filePath: string;
}

// ============================================
// UPLOAD HELPERS
// ============================================

export async function uploadConceptImage(
    base64Data: string,
    mimeType: string,
    conceptId: string,
    index: number
): Promise<UploadedImage> {
    const imagekit = getImageKit();

    // Ensure proper data URI format
    const dataUri = base64Data.startsWith('data:')
        ? base64Data
        : `data:${mimeType};base64,${base64Data}`;

    const response = await imagekit.upload({
        file: dataUri,
        fileName: `concept_${Date.now()}_${index}.png`,
        folder: `${AI_VISION_FOLDER}/concepts/${conceptId}`,
        useUniqueFileName: true,
    });

    // Generate thumbnail URL
    const thumbnailUrl = imagekit.url({
        path: response.filePath,
        transformation: [
            { height: '300', width: '300', focus: 'auto', crop: 'maintain_ratio' }
        ],
    });

    logger.info('Image uploaded to ImageKit', {
        conceptId,
        fileId: response.fileId,
    });

    return {
        url: response.url,
        thumbnailUrl,
        fileId: response.fileId,
        filePath: response.filePath,
    };
}

export async function uploadReferenceImage(
    base64Data: string,
    mimeType: string,
    sessionToken: string
): Promise<UploadedImage> {
    const imagekit = getImageKit();

    const dataUri = base64Data.startsWith('data:')
        ? base64Data
        : `data:${mimeType};base64,${base64Data}`;

    const response = await imagekit.upload({
        file: dataUri,
        fileName: `reference_${Date.now()}.png`,
        folder: `${AI_VISION_FOLDER}/uploads/${sessionToken}`,
        useUniqueFileName: true,
    });

    const thumbnailUrl = imagekit.url({
        path: response.filePath,
        transformation: [{ height: '300', width: '300' }],
    });

    return {
        url: response.url,
        thumbnailUrl,
        fileId: response.fileId,
        filePath: response.filePath,
    };
}

export async function deleteImage(fileId: string): Promise<void> {
    try {
        const imagekit = getImageKit();
        await imagekit.deleteFile(fileId);
        logger.info('Image deleted from ImageKit', { fileId });
    } catch (error) {
        logger.error('Failed to delete image', { fileId, error });
        // Don't throw - cleanup failures shouldn't break the flow
    }
}
