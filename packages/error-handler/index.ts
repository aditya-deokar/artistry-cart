export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly details: any;
    public readonly code: string;

    constructor(
        message: string,
        statusCode: number,
        code?: string,
        isOperational = true,
        details?: any
    ) {
        super(message);
        this.statusCode = statusCode;
        this.code = code || this.constructor.name.replace('Error', '').toUpperCase();
        this.isOperational = isOperational;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Not Found Error
export class NotFoundError extends AppError {
    constructor(message = 'Resource not found', details?: any) {
        super(message, 404, 'NOT_FOUND', true, details);
    }
}

// Validation Error (zod/ react-hook-form validation error)
export class ValidationError extends AppError {
    constructor(message = 'Invalid request data', details?: any) {
        super(message, 400, 'VALIDATION_ERROR', true, details);
    }
}

// Authentication Error
export class AuthError extends AppError {
    constructor(message = 'Unauthorized', details?: any) {
        super(message, 401, 'UNAUTHORIZED', true, details);
    }
}

// Forbidden Error (for Insufficient Permission)
export class ForbiddenError extends AppError {
    constructor(message = 'Forbidden access', details?: any) {
        super(message, 403, 'FORBIDDEN', true, details);
    }
}

// Database Error 
export class DatabaseError extends AppError {
    constructor(message = 'Database error', details?: any) {
        super(message, 500, 'DATABASE_ERROR', true, details);
    }
}

// Rate Limit Error
export class RateLimitError extends AppError {
    constructor(message = 'Too many requests, please try again later', details?: any) {
        super(message, 429, 'RATE_LIMIT_EXCEEDED', true, details);
    }
}

// Internal Server Error
export class InternalServerError extends AppError {
    constructor(message = 'Internal server error', details?: any) {
        super(message, 500, 'INTERNAL_ERROR', true, details);
    }
}

