import { Request, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import prisma from '../config/database';


interface TokenPayload {
    id: string;
    email: string;
    role: string;
}

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
    sessionToken?: string;
    requestId?: string;
}

/**
 * Auth middleware - supports both authenticated and anonymous users
 */
export const authMiddleware: RequestHandler = async (req, _res, next): Promise<void> => {
    const authReq = req as AuthenticatedRequest;

    // Generate request ID for tracking
    authReq.requestId = uuidv4();

    // Get session token from header or cookie
    authReq.sessionToken =
        (req.headers['x-session-token'] as string) ||
        req.cookies?.sessionToken ||
        uuidv4();

    // Try to extract JWT token
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (token) {
        try {
            const decoded = jwt.verify(token, config.jwtSecret) as TokenPayload;

            // Verify user exists
            const user = await prisma.users.findUnique({
                where: { id: decoded.id },
                select: { id: true, email: true, role: true },
            });

            if (user) {
                authReq.user = {
                    id: user.id,
                    email: user.email || '',
                    role: user.role,
                };
            }
        } catch {
            // Invalid token - continue as anonymous
        }
    }

    next();
};

/**
 * Require authenticated user
 */
export const requireAuth: RequestHandler = async (req, res, next): Promise<void> => {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
        res.status(401).json({
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message: 'Authentication required',
            },
        });
        return;
    }

    next();
};

/**
 * Require seller role
 */
export const requireSeller: RequestHandler = async (req, res, next): Promise<void> => {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
        res.status(401).json({
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message: 'Authentication required',
            },
        });
        return;
    }

    if (authReq.user.role !== 'seller' && authReq.user.role !== 'admin') {
        res.status(403).json({
            success: false,
            error: {
                code: 'FORBIDDEN',
                message: 'Seller access required',
            },
        });
        return;
    }

    next();
};
