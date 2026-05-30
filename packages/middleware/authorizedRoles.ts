import { NextFunction, Response } from "express";
import { AuthError } from "@artistry-cart/error-handler";
import type { AuthenticatedRequest } from "./auth-contract";

export const isSeller = async(req: AuthenticatedRequest, res: Response, next:NextFunction)=>{
    if(req.role !== "seller"){
        return next(new AuthError("Access denied: Seller Only"))
    }
    next();
}


export const isUser = async(req: AuthenticatedRequest, res: Response, next:NextFunction)=>{
    if(req.role !== "user"){
        return next(new AuthError("Access denied: User Only"))
    }
    next();
}
