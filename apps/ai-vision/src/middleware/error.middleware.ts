import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly isOperational: boolean;

    constructor(
        message: string,
        statusCode: number = 500,
        code: string = 'INTERNAL_ERROR',
        isOperational: boolean = true
    ) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Express error handling middleware
 */
export const errorMiddleware = (
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    logger.error('Error caught by middleware', {
        message: err.message,
        name: err.name,
        path: req.path,
        method: req.method,
    });

    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
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
        res.status(400).json({
            success: false,
            error: {
                code: 'DATABASE_ERROR',
                message: 'A database error occurred',
            },
        });
        return;
    }

    // Handle validation errors
    if (err.name === 'ZodError') {
        res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid request data',
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
