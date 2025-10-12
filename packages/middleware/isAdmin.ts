import { Response, NextFunction } from 'express';
import { AuthError } from '../error-handler';

/**
 * Middleware to check if authenticated user has admin role
 * Should be used after isAuthenticated middleware
 */
export const isAdmin = (req: any, res: Response, next: NextFunction) => {
  try {
    // Check if user exists (should be set by isAuthenticated middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    // Check if user has admin role
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
        code: "INSUFFICIENT_PRIVILEGES"
      });
    }

    // User is admin, proceed to next middleware
    return next();
  } catch (error) {
    next(new AuthError("Admin authorization failed"));
  }
};

export default isAdmin;
