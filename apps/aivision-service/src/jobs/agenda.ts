import Agenda, { Job } from 'agenda';
import { config } from '../config';
import { logger } from '../utils/logger';
import prisma from '../../../../packages/libs/prisma';

let agenda: Agenda | null = null;

/**
 * Initialize Agenda.js job queue
 */
export async function initAgenda(): Promise<Agenda> {
    if (agenda) return agenda;

    if (!config.database.url) {
        logger.warn('Database URL not configured, skipping Agenda');
        throw new Error('Database URL required for Agenda');
    }

    agenda = new Agenda({
        db: {
            address: config.database.url,
            collection: 'agendaJobs',
        },
        processEvery: '30 seconds',
        maxConcurrency: 5,
        defaultConcurrency: 2,
        lockLimit: 10,
    });

    // Register job definitions
    defineJobs(agenda);

    // Event handlers
    agenda.on('ready', () => {
        logger.info('Agenda job queue ready');
    });

    agenda.on('error', (error) => {
        logger.error('Agenda error', { error: error.message });
    });

    agenda.on('start', (job: Job) => {
        logger.info(`Job starting: ${job.attrs.name}`, { jobId: job.attrs._id });
    });

    agenda.on('complete', (job: Job) => {
        logger.info(`Job complete: ${job.attrs.name}`, { jobId: job.attrs._id });
    });

    agenda.on('fail', (error, job: Job) => {
        logger.error(`Job failed: ${job.attrs.name}`, {
            jobId: job.attrs._id,
            error: error.message,
        });
    });

    await agenda.start();

    // Schedule recurring jobs
    await scheduleRecurringJobs(agenda);

    return agenda;
}

/**
 * Get agenda instance
 */
export function getAgenda(): Agenda | null {
    return agenda;
}

/**
 * Graceful shutdown
 */
export async function stopAgenda(): Promise<void> {
    if (agenda) {
        logger.info('Stopping Agenda...');
        await agenda.stop();
        logger.info('Agenda stopped');
    }
}

/**
 * Define all job handlers
 */
function defineJobs(agendaInstance: Agenda): void {
    // Session cleanup job
    agendaInstance.define('cleanup-expired-sessions', async () => {
        const { expireOldSessions } = await import('../services/session.service.js');
        const count = await expireOldSessions();
        logger.info('Cleaned up expired sessions', { count });
    });

    // Rate limit cleanup job
    agendaInstance.define('cleanup-rate-limits', async () => {

        const cutoff = new Date(Date.now() - 60 * 60 * 1000);
        const result = await prisma.rateLimitEntry.deleteMany({
            where: { windowStart: { lt: cutoff } },
        });
        logger.info('Cleaned up rate limit entries', { count: result.count });
    });

    // Embedding backfill job
    agendaInstance.define('backfill-embeddings', async () => {
        const { generateImageEmbedding, storeConceptImageEmbedding } = await import('../services/embedding.service.js');

        const images = await prisma.conceptImage.findMany({
            where: { embedding: { isEmpty: true } },
            take: 10,
        });

        let processed = 0;
        for (const image of images) {
            const result = await generateImageEmbedding(image.originalUrl);
            if (result.success && result.embedding) {
                await storeConceptImageEmbedding(image.id, result.embedding);
                processed++;
            }
            await new Promise(r => setTimeout(r, 500));
        }

        logger.info('Backfilled embeddings', { total: images.length, processed });
    });

    // Product embedding sync job
    agendaInstance.define('sync-product-embeddings', async () => {
        const { generateImageEmbedding, storeProductEmbedding } = await import('../services/embedding.service.js');

        const existingIds = await prisma.productEmbedding.findMany({ select: { productId: true } });
        const existingSet = new Set(existingIds.map((p: { productId: string }) => p.productId));

        const products = await prisma.products.findMany({
            where: {
                isDeleted: false,
                status: 'Active',
            },
            select: { id: true, images: true },
            take: 10,
        });

        let processed = 0;
        for (const product of products) {
            if (existingSet.has(product.id)) continue;

            const images = product.images as { url?: string }[] | null;
            const imageUrl = images?.[0]?.url;
            if (imageUrl) {
                const result = await generateImageEmbedding(imageUrl);
                if (result.success && result.embedding) {
                    await storeProductEmbedding(product.id, result.embedding);
                    processed++;
                }
            }
            await new Promise(r => setTimeout(r, 500));
        }

        logger.info('Synced product embeddings', { total: products.length, processed });
    });

    // API usage aggregation
    agendaInstance.define('aggregate-api-usage', async () => {
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const stats = await prisma.aPIUsageLog.groupBy({
            by: ['endpoint', 'success'],
            where: { createdAt: { gte: hourAgo } },
            _count: true,
            _avg: { durationMs: true },
        });

        logger.info('API usage stats (last hour)', { stats });
    });
}

/**
 * Schedule recurring jobs
 */
async function scheduleRecurringJobs(agendaInstance: Agenda): Promise<void> {
    await agendaInstance.every('1 hour', 'cleanup-expired-sessions');
    await agendaInstance.every('30 minutes', 'cleanup-rate-limits');
    await agendaInstance.every('5 minutes', 'backfill-embeddings');
    await agendaInstance.every('1 day', 'sync-product-embeddings');
    await agendaInstance.every('1 hour', 'aggregate-api-usage');

    logger.info('Recurring jobs scheduled');
}

/**
 * Run a job immediately
 */
export async function runJobNow(jobName: string, data?: Record<string, unknown>): Promise<void> {
    if (!agenda) {
        throw new Error('Agenda not initialized');
    }
    await agenda.now(jobName, data || {});
}
