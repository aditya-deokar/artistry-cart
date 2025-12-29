import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AppError } from '../../../../packages/error-handler';

/**
 * Express error handling middleware with Winston logging
 * Extends the shared error handler with Winston integration
 */
export const errorMiddleware = (
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    // Enhanced logging with Winston
    logger.error('Error caught by middleware', {
        message: err.message,
        name: err.name,
        path: req.path,
        method: req.method,
        stack: err.stack,
    });

    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
                ...(err.details && { details: err.details })
            },
        });
        return;
    }

    // Handle database connection errors (AggregateError from MongoDB)
    if (err.name === 'AggregateError' ||
        err.message?.includes('ECONNREFUSED') ||
        err.message?.includes('connect ECONNREFUSED')) {
        res.status(503).json({
            success: false,
            error: {
                code: 'DATABASE_UNAVAILABLE',
                message: 'Database connection failed. Please check if MongoDB is running and DATABASE_URL is correct.',
            },
        });
        return;
    }

    // Handle Prisma client initialization errors  
    if (err.name === 'PrismaClientInitializationError') {
        res.status(503).json({
            success: false,
            error: {
                code: 'DATABASE_INIT_ERROR',
                message: 'Failed to initialize database connection. Check DATABASE_URL environment variable.',
            },
        });
        return;
    }

    // Handle Prisma known request errors
    if (err.name === 'PrismaClientKnownRequestError') {
        const prismaError = err as any;
        let message = 'A database error occurred';
        let code = 'DATABASE_ERROR';

        // Handle specific Prisma error codes
        if (prismaError.code === 'P2002') {
            message = 'A record with this unique field already exists';
            code = 'DUPLICATE_RECORD';
        } else if (prismaError.code === 'P2025') {
            message = 'Record not found';
            code = 'NOT_FOUND';
        }

        res.status(400).json({
            success: false,
            error: { code, message },
        });
        return;
    }

    // Handle validation errors
    if (err.name === 'ZodError') {
        const zodError = err as any;
        const details = zodError.errors?.map((e: any) => ({
            path: e.path.join('.'),
            message: e.message,
        }));

        res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid request data',
                details,
            },
        });
        return;
    }

    // Default error response
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: process.env.NODE_ENV === 'production'
                ? 'An unexpected error occurred'
                : err.message,
        },
    });
};
