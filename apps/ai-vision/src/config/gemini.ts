import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { config } from './index';

// ============================================
// LANGCHAIN MODELS (for text/analysis)
// ============================================

export function createGeminiModel(options?: {
    model?: string;
    temperature?: number;
    maxRetries?: number;
    maxOutputTokens?: number;
}) {
    return new ChatGoogleGenerativeAI({
        model: options?.model ?? config.models.text,
        apiKey: config.googleApiKey,
        temperature: options?.temperature ?? 0.7,
        maxRetries: options?.maxRetries ?? 2,
        maxOutputTokens: options?.maxOutputTokens ?? 4096,
    });
}

// Pre-configured models
export const analysisModel = createGeminiModel({
    model: config.models.text,
    temperature: 0.3,
});

export const creativeModel = createGeminiModel({
    model: config.models.text,
    temperature: 0.9,
});

export const productGenModel = createGeminiModel({
    model: config.models.text,
    temperature: 0.5,
});

// ============================================
// NATIVE SDK (for image generation)
// ============================================

let genAI: GoogleGenerativeAI | null = null;

export function getGenAI(): GoogleGenerativeAI {
    if (!genAI) {
        if (!config.googleApiKey) {
            throw new Error('GOOGLE_API_KEY is not configured');
        }
        genAI = new GoogleGenerativeAI(config.googleApiKey);
    }
    return genAI;
}

export function getImageModel() {
    return getGenAI().getGenerativeModel({
        model: config.models.image,
        safetySettings: [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
        ],
    });
}
