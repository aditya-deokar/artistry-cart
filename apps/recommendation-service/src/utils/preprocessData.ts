import { products } from "@prisma/client"

export const preprocessData = (userActions: any, products: products[]) => {
    const interactions: any= []

    userActions.forEach((action:any) => {
        interactions.push({
            userId: action.userId,
            productId: action.productId,
            // timestamp: action.timestamp,
            type: action.type
        })
    });

    return { interactions, products };
}