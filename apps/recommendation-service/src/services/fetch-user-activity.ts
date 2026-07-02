import prisma from "@artistry-cart/libs/prisma";
import { createLogger } from "@artistry-cart/utils/runtime";

const logger = createLogger("recommendation-service");

export const getUserActivity = async (userId: string) => {
  try {
    const userActivity = await prisma.userAnalytics.findUnique({
        where: {
        userId,
        },
        select:{
            actions: true
        }
    });
    return userActivity?.actions || []; 
  } catch (error) {
    logger.error("Error fetching user activity", { error, userId });
    return [];
  }
};


