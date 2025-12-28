import { Router, RequestHandler } from 'express';
import { analysisModel } from '../config/gemini';
import { generateTestImage } from '../services/generation/image.service';
import { logger } from '../utils/logger';

const router: Router = Router();

// Test text generation
const testText: RequestHandler = async (req, res, next): Promise<void> => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            res.status(400).json({
                success: false,
                error: 'Prompt required',
            });
            return;
        }

        logger.info('Testing text generation');

        const response = await analysisModel.invoke([
            ['human', prompt],
        ]);

        res.json({
            success: true,
            data: {
                response: response.content,
                model: 'gemini-2.5-pro',
            },
        });
    } catch (error) {
        logger.error('Text test failed', { error });
        next(error);
    }
};

// Test image generation
const testImage: RequestHandler = async (req, res, next): Promise<void> => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            res.status(400).json({
                success: false,
                error: 'Prompt required',
            });
            return;
        }

        logger.info('Testing image generation');

        const result = await generateTestImage(prompt);

        if (!result.success) {
            res.status(422).json({
                success: false,
                error: result.error,
            });
            return;
        }

        res.json({
            success: true,
            data: {
                hasImage: true,
                mimeType: result.mimeType,
                base64Preview: result.base64?.substring(0, 100) + '...',
                model: 'gemini-2.0-flash-exp',
            },
        });
    } catch (error) {
        logger.error('Image test failed', { error });
        next(error);
    }
};

// Health check with config status
const configCheck: RequestHandler = (_req, res): void => {
    res.json({
        success: true,
        data: {
            googleApiKey: !!process.env.GOOGLE_API_KEY,
            imagekitConfigured: !!(process.env.IMAGEKIT_PUBLIC_API_KEY && process.env.IMAGEKIT_PRIVATE_API_KEY),
            jwtConfigured: !!process.env.ACCESS_TOKEN_SECRET,
            databaseUrl: !!process.env.DATABASE_URL,
        },
    });
};

router.post('/text', testText);
router.post('/image', testImage);
router.get('/config', configCheck);

export default router;
