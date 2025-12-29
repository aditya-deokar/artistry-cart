import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, ZodIssue } from 'zod';

/**
 * Validates request body against a Zod schema
 */
export function validate<T>(schema: ZodSchema<T>) {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid request data',
                        details: error.issues.map((e: ZodIssue) => ({
                            field: e.path.join('.'),
                            message: e.message,
                        })),
                    },
                });
                return;
            }
            next(error);
        }
    };
}

/**
 * Validates query parameters against a Zod schema
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            req.query = schema.parse(req.query) as any;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid query parameters',
                        details: error.issues.map((e: ZodIssue) => ({
                            field: e.path.join('.'),
                            message: e.message,
                        })),
                    },
                });
                return;
            }
            next(error);
        }
    };
}
