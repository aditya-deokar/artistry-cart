import { RequestHandler } from 'express';
import prisma from '../config/database';
import { config } from '../config';
import { AuthenticatedRequest } from './auth.middleware';

interface RateLimitConfig {
    limit: number;
    windowMs: number;
}

/**
 * Create rate limiter middleware
 */
export function createRateLimiter(rateLimitConfig?: RateLimitConfig): RequestHandler {
    const limitConfig = rateLimitConfig || config.rateLimit.default;

    return async (req, res, next): Promise<void> => {
        const authReq = req as AuthenticatedRequest;
        const identifier = authReq.user?.id || req.ip || 'anonymous';
        const endpoint = req.path;
        const key = `${identifier}:${endpoint}`;

        try {
            const windowStart = new Date(Date.now() - limitConfig.windowMs);

            // Find or create rate limit entry
            const entry = await prisma.rateLimitEntry.findUnique({
                where: { key },
            });

            if (entry && entry.windowStart > windowStart) {
                // Within current window
                if (entry.count >= limitConfig.limit) {
                    res.status(429).json({
                        success: false,
                        error: {
                            code: 'RATE_LIMITED',
                            message: 'Too many requests, please try again later',
                            retryAfter: Math.ceil(limitConfig.windowMs / 1000),
                        },
                    });
                    return;
                }

                // Increment count
                await prisma.rateLimitEntry.update({
                    where: { key },
                    data: { count: { increment: 1 } },
                });
            } else {
                // Create new window
                await prisma.rateLimitEntry.upsert({
                    where: { key },
                    create: {
                        key,
                        count: 1,
                        windowStart: new Date(),
                    },
                    update: {
                        count: 1,
                        windowStart: new Date(),
                    },
                });
            }

            // Set rate limit headers
            const remaining = entry ? Math.max(0, limitConfig.limit - entry.count - 1) : limitConfig.limit - 1;
            res.setHeader('X-RateLimit-Limit', limitConfig.limit.toString());
            res.setHeader('X-RateLimit-Remaining', remaining.toString());
            res.setHeader('X-RateLimit-Reset', new Date(Date.now() + limitConfig.windowMs).toISOString());

            next();
        } catch (error) {
            console.error('Rate limit check failed:', error);
            next();
        }
    };
}

// Pre-configured rate limiters
export const generateLimiter: RequestHandler = createRateLimiter(config.rateLimit.generate);
export const searchLimiter: RequestHandler = createRateLimiter(config.rateLimit.search);
export const conceptsLimiter: RequestHandler = createRateLimiter(config.rateLimit.concepts);
export const defaultLimiter: RequestHandler = createRateLimiter(config.rateLimit.default);
