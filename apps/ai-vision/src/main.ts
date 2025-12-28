import express, { Express } from 'express';
import dotenv from 'dotenv';
import path from 'path';

// Load .env explicitly
dotenv.config({ path: path.join(__dirname, '../../../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from './middleware/error.middleware';
import routes from './routes';
import { logger } from './utils/logger';
import { initAgenda, stopAgenda } from './jobs/agenda';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 6006;

const app: Express = express();

// Startup Debug Logging
const dbUrl = process.env.DATABASE_URL;
logger.info('🚀 Service Startup Config:', {
    host,
    port,
    dbUrlMasked: dbUrl ? dbUrl.replace(/:([^:@]+)@/, ':***@') : 'UNDEFINED',
    nodeEnv: process.env.NODE_ENV
});

// Direct Health Check (Bypass middleware)
import prisma from './config/database';
app.get('/health', async (req, res) => {
    try {
        await prisma.$connect();
        // MongoDB ping
        await prisma.$runCommandRaw({ ping: 1 });
        res.json({
            status: 'ok',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        logger.error('Health check failed', { error: error.message });
        res.status(503).json({
            status: 'error',
            database: 'disconnected',
            error: error.message,
            code: error.code
        });
    }
});

// CORS configuration
app.use(cors({
    origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:8080",
        process.env.FRONTEND_URL || "http://localhost:3000"
    ].filter(Boolean),
    allowedHeaders: ['Authorization', 'Content-Type', 'X-Requested-With', 'Accept', 'X-Session-Token'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));

// Middleware
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Health check
app.get('/', (req, res) => {
    res.json({
        message: 'AI Vision Service API',
        version: '1.0.0',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        endpoints: {
            generate: '/api/v1/ai/generate',
            search: '/api/v1/ai/search',
            concepts: '/api/v1/ai/concepts',
            artisans: '/api/v1/ai/artisans',
            gallery: '/api/v1/ai/gallery',
        }
    });
});

// API Routes
app.use('/api/v1/ai', routes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use(errorMiddleware);

// Start server
const server = app.listen(port, async () => {
    logger.info(`🚀 AI Vision Service running at http://${host}:${port}`);
    logger.info(`📊 Health Check: http://${host}:${port}/`);
    logger.info(`🎨 API: http://${host}:${port}/api/v1/ai`);

    // Initialize Agenda (background jobs)
    try {
        await initAgenda();
        logger.info('📋 Background jobs initialized');
    } catch (error) {
        logger.warn('⚠️ Failed to initialize background jobs', { error });
    }
});

server.on('error', (err) => {
    logger.error('Server Error:', err);
});

// Graceful shutdown
async function shutdown(signal: string) {
    logger.info(`${signal} received, shutting down gracefully`);

    // Stop Agenda first
    await stopAgenda();

    server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
    });

    // Force exit after timeout
    setTimeout(() => {
        logger.error('Forced exit after timeout');
        process.exit(1);
    }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;

