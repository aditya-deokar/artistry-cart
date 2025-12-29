import { imagekit as sharedImageKit } from '../../../../packages/libs/imageKit';
import { logger } from '../utils/logger';

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
    // Ensure proper data URI format
    const dataUri = base64Data.startsWith('data:')
        ? base64Data
        : `data:${mimeType};base64,${base64Data}`;

    const response = await sharedImageKit.upload({
        file: dataUri,
        fileName: `concept_${Date.now()}_${index}.png`,
        folder: `${AI_VISION_FOLDER}/concepts/${conceptId}`,
        useUniqueFileName: true,
    });

    // Generate thumbnail URL
    const thumbnailUrl = sharedImageKit.url({
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
    const dataUri = base64Data.startsWith('data:')
        ? base64Data
        : `data:${mimeType};base64,${base64Data}`;

    const response = await sharedImageKit.upload({
        file: dataUri,
        fileName: `reference_${Date.now()}.png`,
        folder: `${AI_VISION_FOLDER}/uploads/${sessionToken}`,
        useUniqueFileName: true,
    });

    const thumbnailUrl = sharedImageKit.url({
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
        await sharedImageKit.deleteFile(fileId);
        logger.info('Image deleted from ImageKit', { fileId });
    } catch (error) {
        logger.error('Failed to delete image', { fileId, error });
        // Don't throw - cleanup failures shouldn't break the flow
    }
}
