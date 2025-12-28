// Environment configuration
export const config = {
    // Server
    host: process.env.HOST ?? 'localhost',
    port: process.env.PORT ? Number(process.env.PORT) : 6006,
    nodeEnv: process.env.NODE_ENV || 'development',

    // Database
    database: {
        url: process.env.DATABASE_URL || '',
    },

    // Google AI
    googleApiKey: process.env.GOOGLE_API_KEY!,

    // HuggingFace
    huggingfaceApiKey: process.env.HUGGINGFACE_API_KEY,

    // ImageKit
    imagekit: {
        publicKey: process.env.IMAGEKIT_PUBLIC_API_KEY!,
        privateKey: process.env.IMAGEKIT_PRIVATE_API_KEY!,
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/adityadeokar/',
    },

    // JWT
    jwtSecret: process.env.ACCESS_TOKEN_SECRET!,

    // Rate limiting
    rateLimit: {
        generate: { limit: 10, windowMs: 60000 },
        search: { limit: 30, windowMs: 60000 },
        concepts: { limit: 60, windowMs: 60000 },
        default: { limit: 100, windowMs: 60000 },
    },

    // AI Models
    models: {
        text: 'gemini-2.5-pro',
        flash: 'gemini-2.5-flash',
        image: 'gemini-2.0-flash-exp',
    },
};

// Validate required env vars
export function validateEnv(): void {
    const required = ['GOOGLE_API_KEY', 'ACCESS_TOKEN_SECRET'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.warn(`⚠️ Missing environment variables: ${missing.join(', ')}`);
    }
}
