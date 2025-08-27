import { NextFunction, Response } from "express";
import Stripe from "stripe"
import { ValidationError } from "../../../../packages/error-handler";
import redis from "../../../../packages/libs/redis";

const stripe = new Stripe(process.env.STRIPE_SECRETE_KEY!, {
    apiVersion: "2025-06-30.basil",
});

// create payment intent
export const createPaymentIntent = async ( req: any, res:Response, next:NextFunction)=>{
    const { amount , sellerStripeAccountId, sessionId }= req.body;

    const customerAmount= Math.round(amount *100);
    const platformFee= Math.floor(customerAmount * 0.1);

    try {
        const paymentIntent= await stripe.paymentIntents.create({
            amount: customerAmount,
            currency: "usd",
            payment_method_types: ["card"],
            application_fee_amount: platformFee,
            transfer_data:{
                destination: sellerStripeAccountId
            },
            metadata:{
                sessionId,
                userId : req.user.id
            }
        })

        res.send({
            clientSecret: paymentIntent.client_secret,
        })
    } catch (error) {
        next(error)
    }
}

// create payment session
export const createPaymentSession = async (req: any, res:Response, next:NextFunction)=>{
    try {
        const { cart, selectedAddressId, coupon } = req.body;
        const userId = req.user.id;

        if(!cart || !Array.isArray(cart) || cart.length === 0 ){
            return next(new ValidationError("Cart is Empty or Invalid."));

        }

        const normalizedCart = JSON.stringify(
            cart.map((item:any) => ({
                id: item.id,
                quantity: item.quantity,
                sale_price : item.sale_price,
                shopId: item.shopId,
                selectedOptions: item.selectedoptions || {},

            })).sort((a,b)=> a.id.localCompare(b.id))


        )

        const keys = await redis.keys("payment-session:*");

        for(const key of keys){
            const data= await redis.get(key);
            if(data){
                const session = JSON.parse(data);
                if(session.userId === userId){
                    const existingCart = JSON.stringify(session.cart.map((item:any)=>({
                        id: item.id,
                        quantity:item.quantity,
                        sale_price: item.sale_price,
                        shopId: item.shopId,
                        selectedOptions: item.selectedoptions || {},
                    })).sort((a:any, b:any)=> a.id.localCompare(b.id)))
                

                    if(existingCart === normalizedCart){
                        return res.status(200).json({
                            sessionId: key.split(":")[1]
                        })
                    } else{
                        await redis.del(key);
                    }


                }
            }
        }

        // 
    } catch (error) {
        next(error)
    }
}