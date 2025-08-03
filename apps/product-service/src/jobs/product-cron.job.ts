import cron from "node-cron";
import prisma from "../../../../packages/libs/prisma";

cron.schedule("0 * * * *", async()=>{
    try {
        const now= new Date();
        const deletedProduct= await prisma.products.deleteMany({
            where:{
                isDeleted: true,
                deletedAt:{
                    lte: now
                },
            }
        });

        // console.log(`${deletedProduct.count} expired products permanently deleted.`)
        
    } catch (error) {
        console.log(error)
    }
})