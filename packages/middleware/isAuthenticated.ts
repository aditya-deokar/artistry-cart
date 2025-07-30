import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../libs/prisma";

interface TokenPayload {
    id: string;
    role: "user" | "seller";
    iat: number;
    exp: number;
}

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.access_token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized! Token missing."
            });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as TokenPayload;

        let account;

        if (decoded.role === "user") {
            account = await prisma.users.findUnique({
                where: {
                    id: decoded.id
                }
            });
        } else if (decoded.role === 'seller') {
            account = await prisma.sellers.findUnique({
                where: {
                    id: decoded.id
                },
                include: {
                    shop: true
                }
            });
        }

        if (!account) {
            return res.status(401).json({
                message: "Account not found!"
            });
        }

        req.user = account;
        req.role = decoded.role;

        return next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                message: "Unauthorized! Token has expired."
            });
        }
        // For other JWT errors, like a malformed token
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                message: "Unauthorized! Invalid token."
            });
        }

        
        return next(error);
    }
};

export default isAuthenticated;