
// get recommended products

import { NextFunction, Response } from "express";
import { recommendProducts } from "../services/recommendation-service";
import prisma from "../../../../packages/libs/prisma";

export const getRecommendedProducts = async (req: any, res: Response, next:NextFunction) => {
    try {
        const { userId } = req.params;
        const products= await prisma.products.findMany({
            include:{
                Shop: true,
            }
        })

        let userAnalytics = await prisma.userAnalytics.findUnique({
            where:{
                userId
            },
            select:{
                actions:true,
                recommendations :true,
                lastTrained: true,
            },

        })

        const now =new Date();
        let recommendedProducts=[];

        if(!userAnalytics){
            recommendedProducts= products.slice(-10);
        }else{
            const actions= Array.isArray(userAnalytics.actions) ? (userAnalytics.actions as any[]) : [];

            const recommendations= Array.isArray(userAnalytics.recommendations) ? (userAnalytics.recommendations as string[]) : [];

            const lastTrainedTime= userAnalytics.lastTrained ? new Date(userAnalytics.lastTrained) : null;

            const hoursDiff= lastTrainedTime ? (now.getTime() - lastTrainedTime.getTime()) / (1000 * 60 * 60) : Infinity;


            if(actions.length < 50){
                recommendedProducts= products.slice(-10);

            }else if(hoursDiff < 3 && recommendations.length > 0){
                recommendedProducts= products.filter((product)=> recommendations.includes(product.id));
            }else{
                const recommendedProductIds= await recommendProducts(userId, products);
                recommendedProducts= products.filter((product)=> recommendedProductIds.includes(product.id));

              
                await prisma.userAnalytics.update({
                    where:{
                        userId
                    },
                    data:{
                        recommendations : recommendedProductIds,
                        lastTrained:now
                    }
                })
            }
        }

        res.status(200).json({
            success:true,
            recommendations: recommendedProducts
        })

        
    } catch (error) {
        console.error("Error fetching recommended products:", error);
        res.status(500).json({ error: "Failed to fetch recommended products" });
    }
};
