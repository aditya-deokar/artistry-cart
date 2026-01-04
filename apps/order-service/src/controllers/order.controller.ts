import { NextFunction, Response } from "express";
import Stripe from "stripe";
import { ValidationError } from "../../../../packages/error-handler";
import redis from "../../../../packages/libs/redis";
import prisma from "../../../../packages/libs/prisma";
import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { sendEmail } from "../utils/send-email";
const stripe = new Stripe(process.env.STRIPE_SECRETE_KEY!, {
  apiVersion: "2025-06-30.basil",
});

// create payment intent
export const createPaymentIntent = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const { amount, sellerStripeAccountId, sessionId } = req.body;

  const customerAmount = Math.round(amount * 100);
  const platformFee = Math.floor(customerAmount * 0.1);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: customerAmount,
      currency: "usd",
      payment_method_types: ["card"],
      application_fee_amount: platformFee,
      transfer_data: {
        destination: sellerStripeAccountId,
      },
      metadata: {
        sessionId,
        userId: req.user.id,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    next(error);
  }
};

// create payment session
export const createPaymentSession = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { cart, selectedAddressId, coupon } = req.body;
    const userId = req.user.id;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return next(new ValidationError("Cart is Empty or Invalid."));
    }

    const normalizedCart = JSON.stringify(
      cart
        .map((item: any) => ({
          id: item.id,
          quantity: item.quantity,
          sale_price: item.sale_price,
          shopId: item.shopId,
          selectedOptions: item.selectedoptions || {},
        }))
        .sort((a, b) => a.id.localCompare(b.id))
    );

    const keys = await redis.keys("payment-session:*");

    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        const session = JSON.parse(data);
        if (session.userId === userId) {
          const existingCart = JSON.stringify(
            session.cart
              .map((item: any) => ({
                id: item.id,
                quantity: item.quantity,
                sale_price: item.sale_price,
                shopId: item.shopId,
                selectedOptions: item.selectedoptions || {},
              }))
              .sort((a: any, b: any) => a.id.localCompare(b.id))
          );

          if (existingCart === normalizedCart) {
            return res.status(200).json({
              sessionId: key.split(":")[1],
            });
          } else {
            await redis.del(key);
          }
        }
      }
    }

    // fetch seller and their stripe accounts
    const uniqueShopIds = [...new Set(cart.map((item: any) => item.shopId))];

    const shops = await prisma.shops.findMany({
      where: {
        id: {
          in: uniqueShopIds,
        },
      },
      select: {
        id: true,
        sellerId: true,
        sellers: {
          select: {
            stripeId: true,
          },
        },
      },
    });

    const sellerData = shops.map((shop) => ({
      shopId: shop?.id,
      sellerId: shop?.sellerId,
      stripeAccountId: shop?.sellers?.stripeId,
    }));

    // calculate total
    const totalAmount = cart.reduce((total: number, item: any) => {
      return total + item.quantity * item.sale_price;
    }, 0);

    // create a session payload
    const sessionId = crypto.randomUUID();

    const sessionData = {
      userId,
      cart,
      sellers: sellerData,
      totalAmount,
      shippingAddressId: selectedAddressId || null,
      coupon: coupon || null,
    };

    await redis.setex(
      `payment-session:${sessionId}`,
      600,
      JSON.stringify(sessionData)
    );
    return res.status(200).json({
      sessionId,
    });
  } catch (error) {
    next(error);
  }
};

// Verifying payment session
export const verifyingPaymentSession = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionId = req.query.sessionId as string;

    if (!sessionId) {
      return res.status(400).json({
        error: "Session ID is Required!",
      });
    }

    // fetch session from redis
    const sessionKey = `payment-session:${sessionId}`;
    const sessionData = await redis.get(sessionKey);

    if (!sessionData) {
      return res.status(404).json({
        error: "Session not found or expired. ",
      });
    }

    // parse and return session
    const session = JSON.parse(sessionData);

    return res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    return next(error);
  }
};

// create order
export const createOrder = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const stripeSignature = req.headers["stripe-signature"];
    if (!stripeSignature) {
      return res.status(400).send("Missing Stripe Signature");
    }

    const rawBody = (req as any).rawBody;

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        stripeSignature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error("Webhook signature verification failed. ", err.message);
    }

    if (event?.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const sessionId = paymentIntent.metadata.sessionId;
      const userId = paymentIntent.metadata.userId;

      const sessionKey = `payment-session:${sessionId}`;
      const sessionData = await redis.get(sessionKey);

      if (!sessionData) {
        console.warn("Session data expired or missing for ", sessionId);
        return res
          .status(200)
          .send("No session found, Skipping order creation");
      }

      const { cart, totalAmount, shippingAddressId, coupon } =
        JSON.parse(sessionData);

      const user = await prisma.users.findUnique({
        where: {
          id: userId,
        },
      });

      const name = user?.name!;
      const email = user?.email!;

      const shopGrouped = cart.reduce((acc: any, item: any) => {
        if (!acc[item.shopId]) acc[item.shopId] = [];

        acc[item.shopId].push(item);
        return acc;
      }, {});

      for (const shopId in shopGrouped) {
        const orderItems = shopGrouped[shopId];

        let orderTotal = orderItems.reduce(
          (sum: number, p: any) => sum + p.quantity * p.sale_price,
          0
        );

        // apply discount if applicable
        if (
          coupon &&
          coupon.discountedProductId &&
          orderItems.some((item: any) => item.id === coupon.discountedProductId)
        ) {
          const discountedItem = orderItems.find(
            (item: any) => item.id === coupon.discountedProductId
          );

          if (discountedItem) {
            const discount =
              coupon.discountPercent > 0
                ? (discountedItem.sale_price *
                  discountedItem.quantity *
                  coupon.discountPercent) /
                100
                : coupon.discountAmount;

            orderTotal -= discount;
          }
        }

        // Calculate platform fee and seller amount
        const customerAmount = Math.round(orderTotal * 100); // in cents
        const platformFee = Math.floor(customerAmount * 0.1); // 10% admin margin
        const sellerAmount = customerAmount - platformFee;

        // create order with payment record
        const createdOrder = await prisma.orders.create({
          data: {
            userId,
            shopId: shopId,
            totalAmount: orderTotal,
            status: "PAID",
            shippingAddressId: shippingAddressId || null,
            couponCode: coupon?.code || null,
            discountAmount: coupon?.discountAmount || 0,
            items: {
              create: orderItems.map((item: any) => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.sale_price,
                selectedOptions: item.selectedOptions,
              }))
            },
            // Create payment record
            payment: {
              create: {
                stripePaymentIntent: paymentIntent.id,
                stripeChargeId: paymentIntent.latest_charge as string || null,
                amount: customerAmount / 100, // Store in dollars
                currency: paymentIntent.currency || "usd",
                platformFee: platformFee / 100, // 10% admin margin in dollars
                sellerAmount: sellerAmount / 100, // 90% seller amount in dollars
                status: "SUCCEEDED",
                paymentMethod: paymentIntent.payment_method_types?.[0] || "card",
                metadata: {
                  sessionId,
                  userId,
                  shopId,
                },
              }
            }
          }
        });


        // update product and Analytics
        for (const item of orderItems) {
          const { id: productId, quantity } = item;

          await prisma.products.update({
            where: {
              id: productId
            },
            data: {
              stock: {
                decrement: quantity
              },
              totalSales: {
                increment: quantity
              },

            },

          })

          await prisma.productAnalytics.upsert({
            where: {
              id: productId
            },
            create: {
              productId,
              shopId,
              purchases: quantity,
              lastViewedAt: new Date(),

            },
            update: {
              purchases: { increment: quantity }
            }
          })


          const existingAnalytics = await prisma.userAnalytics.findUnique({
            where: {
              userId
            }
          })

          const newAction = {
            productId,
            shopId,
            action: "purchase",
            timeStamp: Date.now(),
          };

          const currentActions = Array.isArray(existingAnalytics?.actions) ? (existingAnalytics.actions as Prisma.JsonArray) : [];

          if (existingAnalytics) {
            await prisma.userAnalytics.update({
              where: {
                userId
              },
              data: {
                lastVisited: new Date(),
                actions: [...currentActions, newAction],
              },
            })
          } else {
            await prisma.userAnalytics.create({
              data: {
                userId,
                lastVisited: new Date(),
                actions: [newAction],
              },
            })
          }

        }

        // send email for user
        await sendEmail(
          email,
          "Your Artistry Cart Order Confirmation",
          "order-confirmation",
          {
            name,
            cart,
            totalAmount: coupon?.discountAmount ? totalAmount - coupon?.discountAmount : totalAmount,
            trackingUrl: `https://artistry.com/order/${sessionId}`,
          }
        )


        // Create notification for sellers
        const createedShopIds = Object.keys(shopGrouped);
        const sellerShops = await prisma.shops.findMany({
          where: {
            id: {
              in: createedShopIds
            }
          },
          select: {
            id: true,
            sellerId: true,
            name: true,
          }
        })

        // Notification for Shop
        for (const shop of sellerShops) {
          const firstProduct = shopGrouped[shop.id][0];
          const productTitle = firstProduct?.title || "new item";

          await prisma.notification.create({
            data: {
              title: "New Order Received",
              message: `A Customer just ordered ${productTitle} from your shop.`,
              createrId: userId,
              recieverId: shop.sellerId,
              redirect_link: `https://artistry.com/order/${sessionId}`
            }
          })
        }

        // Notification for Admin

        await prisma.notification.create({
          data: {
            title: "Platform Order Alert",
            message: `A New Order was placed by ${name}.`,
            createrId: userId,
            recieverId: "admin",
            redirect_link: `https://artistry.com/order/${sessionId}`
          }
        })

        await redis.del(sessionKey)


      }
    }

    res.status(200).json({
      received: true
    })

  } catch (error) {
    console.log(error);
    return next(error);
  }
};

// Verify session and create payment intent (combined endpoint for checkout page)
export const verifySessionAndCreateIntent = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionId = req.query.sessionId as string;

    if (!sessionId) {
      return res.status(400).json({
        error: "Session ID is required!",
      });
    }

    // Fetch session from redis
    const sessionKey = `payment-session:${sessionId}`;
    const sessionData = await redis.get(sessionKey);

    if (!sessionData) {
      return res.status(404).json({
        error: "Session not found or expired.",
      });
    }

    const session = JSON.parse(sessionData);
    const { totalAmount, sellers } = session;

    // Get the first seller's Stripe account (for single-seller orders)
    // For multi-seller orders, we'd need separate payment intents
    const firstSeller = sellers[0];
    if (!firstSeller?.stripeAccountId) {
      return res.status(400).json({
        error: "Seller has not completed Stripe onboarding.",
      });
    }

    const customerAmount = Math.round(totalAmount * 100);
    const platformFee = Math.floor(customerAmount * 0.1); // 10% admin margin

    const paymentIntent = await stripe.paymentIntents.create({
      amount: customerAmount,
      currency: "usd",
      payment_method_types: ["card"],
      application_fee_amount: platformFee,
      transfer_data: {
        destination: firstSeller.stripeAccountId,
      },
      metadata: {
        sessionId,
        userId: req.user.id,
        shopId: firstSeller.shopId,
        sellerId: firstSeller.sellerId,
      },
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      session,
    });
  } catch (error) {
    return next(error);
  }
};

// Get user's orders with pagination
export const getUserOrders = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    const whereClause: any = { userId };
    if (status && status !== "all") {
      whereClause.status = status.toUpperCase();
    }

    const [orders, total] = await Promise.all([
      prisma.orders.findMany({
        where: whereClause,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  images: true,
                  slug: true,
                },
              },
            },
          },
          shops: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          payment: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.orders.count({ where: whereClause }),
    ]);

    return res.status(200).json({
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return next(error);
  }
};

// Get single order details
export const getOrderDetails = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await prisma.orders.findFirst({
      where: {
        id: orderId,
        userId, // Ensure user owns this order
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                images: true,
                slug: true,
                brand: true,
              },
            },
          },
        },
        shops: {
          select: {
            id: true,
            name: true,
            slug: true,
            avatar: true,
          },
        },
        payment: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        error: "Order not found.",
      });
    }

    return res.status(200).json({ order });
  } catch (error) {
    return next(error);
  }
};

// Get payment status for confirmation page
export const getPaymentStatus = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const paymentIntentId = req.query.payment_intent as string;

    if (!paymentIntentId) {
      return res.status(400).json({
        error: "Payment intent ID is required.",
      });
    }

    // Get payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Find the corresponding order by session ID in metadata
    const sessionId = paymentIntent.metadata?.sessionId;
    let order = null;

    if (sessionId) {
      // Try to find order by payment record
      const payment = await prisma.payments.findUnique({
        where: { stripePaymentIntent: paymentIntentId },
        include: {
          order: {
            include: {
              items: {
                include: {
                  product: {
                    select: {
                      id: true,
                      title: true,
                      images: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      order = payment?.order;
    }

    return res.status(200).json({
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      order,
    });
  } catch (error) {
    return next(error);
  }
};

// ============================================
// PHASE 3: ORDER MANAGEMENT ENDPOINTS
// ============================================

// Cancel an order (only if PENDING or PAID but not yet shipped)
export const cancelOrder = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const { reason } = req.body;

    const order = await prisma.orders.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        payment: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    // Only allow cancellation for PENDING or PAID orders
    if (!["PENDING", "PAID"].includes(order.status)) {
      return res.status(400).json({
        error: `Cannot cancel order with status: ${order.status}. Only PENDING or PAID orders can be cancelled.`,
      });
    }

    // If payment exists and was successful, initiate refund
    if (order.payment && order.payment.status === "SUCCEEDED") {
      try {
        const refund = await stripe.refunds.create({
          payment_intent: order.payment.stripePaymentIntent,
          reason: "requested_by_customer",
        });

        // Create refund record
        await prisma.refunds.create({
          data: {
            paymentId: order.payment.id,
            stripeRefundId: refund.id,
            amount: order.payment.amount,
            reason: reason || "Order cancelled by customer",
            status: refund.status === "succeeded" ? "SUCCEEDED" : "PROCESSING",
            requestedBy: userId,
            requestedByType: "customer",
            processedAt: refund.status === "succeeded" ? new Date() : null,
          },
        });

        // Update payment status
        await prisma.payments.update({
          where: { id: order.payment.id },
          data: { status: "REFUNDED" },
        });
      } catch (stripeError: any) {
        console.error("Stripe refund failed:", stripeError.message);
        return res.status(500).json({
          error: "Failed to process refund. Please contact support.",
        });
      }
    }

    // Update order status
    await prisma.orders.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        deliveryStatus: "Cancelled",
      },
    });

    // Restore stock
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId },
    });

    for (const item of orderItems) {
      await prisma.products.update({
        where: { id: item.productId },
        data: {
          stock: { increment: item.quantity },
          totalSales: { decrement: item.quantity },
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully.",
    });
  } catch (error) {
    return next(error);
  }
};

// Request a refund for a delivered order
export const requestRefund = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId, reason, itemIds } = req.body;
    const userId = req.user.id;

    const order = await prisma.orders.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        payment: true,
        items: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    if (!order.payment) {
      return res.status(400).json({ error: "No payment found for this order." });
    }

    // Calculate refund amount (full or partial based on items)
    let refundAmount = order.payment.amount;
    if (itemIds && itemIds.length > 0) {
      const refundItems = order.items.filter((item) => itemIds.includes(item.id));
      refundAmount = refundItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    // Create Stripe refund
    const refund = await stripe.refunds.create({
      payment_intent: order.payment.stripePaymentIntent,
      amount: Math.round(refundAmount * 100), // Convert to cents
      reason: "requested_by_customer",
    });

    // Create refund record
    const refundRecord = await prisma.refunds.create({
      data: {
        paymentId: order.payment.id,
        stripeRefundId: refund.id,
        amount: refundAmount,
        reason: reason || "Refund requested by customer",
        status: refund.status === "succeeded" ? "SUCCEEDED" : "PROCESSING",
        requestedBy: userId,
        requestedByType: "customer",
        processedAt: refund.status === "succeeded" ? new Date() : null,
      },
    });

    // Update payment status
    const isPartialRefund = refundAmount < order.payment.amount;
    await prisma.payments.update({
      where: { id: order.payment.id },
      data: {
        status: isPartialRefund ? "PARTIALLY_REFUNDED" : "REFUNDED",
      },
    });

    // Update order status
    await prisma.orders.update({
      where: { id: orderId },
      data: { status: "REFUNDED" },
    });

    return res.status(200).json({
      success: true,
      refundId: refundRecord.id,
      stripeRefundId: refund.id,
      amount: refundAmount,
      status: refund.status,
    });
  } catch (error) {
    return next(error);
  }
};

// ============================================
// PHASE 4: WEBHOOK HANDLERS
// ============================================

// Handle payment_intent.payment_failed
export const handlePaymentFailed = async (paymentIntent: Stripe.PaymentIntent) => {
  try {
    const sessionId = paymentIntent.metadata?.sessionId;
    const userId = paymentIntent.metadata?.userId;

    if (!sessionId || !userId) {
      console.warn("Payment failed webhook missing metadata");
      return;
    }

    // Find any existing payment record and update it
    const existingPayment = await prisma.payments.findUnique({
      where: { stripePaymentIntent: paymentIntent.id },
    });

    if (existingPayment) {
      await prisma.payments.update({
        where: { id: existingPayment.id },
        data: {
          status: "FAILED",
          errorMessage: paymentIntent.last_payment_error?.message || "Payment failed",
        },
      });
    }

    // Notify user about failed payment
    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (user) {
      await prisma.notification.create({
        data: {
          title: "Payment Failed",
          message: "Your payment could not be processed. Please try again.",
          createrId: userId,
          recieverId: userId,
          redirect_link: "/checkout",
        },
      });
    }

    console.log(`Payment failed for session ${sessionId}`);
  } catch (error) {
    console.error("Error handling payment failed:", error);
  }
};

// Handle charge.refunded
export const handleChargeRefunded = async (charge: Stripe.Charge) => {
  try {
    const paymentIntentId = charge.payment_intent as string;
    if (!paymentIntentId) return;

    const payment = await prisma.payments.findUnique({
      where: { stripePaymentIntent: paymentIntentId },
      include: { order: true },
    });

    if (!payment) {
      console.warn(`No payment found for refunded charge: ${paymentIntentId}`);
      return;
    }

    // Check if refund record already exists
    const refundId = charge.refunds?.data[0]?.id;
    if (refundId) {
      const existingRefund = await prisma.refunds.findUnique({
        where: { stripeRefundId: refundId },
      });

      if (!existingRefund) {
        // Create refund record from webhook
        await prisma.refunds.create({
          data: {
            paymentId: payment.id,
            stripeRefundId: refundId,
            amount: (charge.amount_refunded || 0) / 100,
            reason: "Refund processed via Stripe",
            status: "SUCCEEDED",
            requestedBy: payment.order?.userId || "",
            requestedByType: "admin",
            processedAt: new Date(),
          },
        });
      }
    }

    // Update payment status
    const isFullRefund = charge.amount_refunded === charge.amount;
    await prisma.payments.update({
      where: { id: payment.id },
      data: {
        status: isFullRefund ? "REFUNDED" : "PARTIALLY_REFUNDED",
      },
    });

    // Update order status
    if (payment.order) {
      await prisma.orders.update({
        where: { id: payment.order.id },
        data: { status: "REFUNDED" },
      });
    }

    console.log(`Charge refunded: ${charge.id}`);
  } catch (error) {
    console.error("Error handling charge refunded:", error);
  }
};

// Handle account.updated (seller onboarding status)
export const handleAccountUpdated = async (account: Stripe.Account) => {
  try {
    // Find seller by Stripe account ID
    const seller = await prisma.sellers.findFirst({
      where: { stripeId: account.id },
    });

    if (!seller) {
      console.warn(`No seller found for Stripe account: ${account.id}`);
      return;
    }

    // Check if onboarding is complete
    const isOnboardingComplete =
      account.charges_enabled && account.payouts_enabled;

    await prisma.sellers.update({
      where: { id: seller.id },
      data: { stripeOnboardingComplete: isOnboardingComplete },
    });

    console.log(
      `Seller ${seller.id} onboarding status: ${isOnboardingComplete ? "complete" : "incomplete"}`
    );
  } catch (error) {
    console.error("Error handling account updated:", error);
  }
};

// Handle transfer.created (payout tracking)
export const handleTransferCreated = async (transfer: Stripe.Transfer) => {
  try {
    const sellerId = transfer.metadata?.sellerId;
    if (!sellerId) return;

    // Check if payout record already exists
    const existingPayout = await prisma.payouts.findUnique({
      where: { stripeTransferId: transfer.id },
    });

    if (!existingPayout) {
      await prisma.payouts.create({
        data: {
          sellerId,
          stripeTransferId: transfer.id,
          amount: transfer.amount / 100,
          currency: transfer.currency,
          status: "COMPLETED",
          processedAt: new Date(),
        },
      });
    }

    console.log(`Transfer created: ${transfer.id} for seller ${sellerId}`);
  } catch (error) {
    console.error("Error handling transfer created:", error);
  }
};

// ============================================
// PHASE 5: SELLER PAYOUT SYSTEM
// ============================================

// Get seller earnings summary
export const getSellerEarnings = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.user.id;

    // Get seller's shop
    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
      include: { shop: true },
    });

    if (!seller?.shop) {
      return res.status(404).json({ error: "Shop not found." });
    }

    const shopId = seller.shop.id;

    // Get all completed orders for this shop
    const orders = await prisma.orders.findMany({
      where: {
        shopId,
        status: { in: ["PAID", "DELIVERED"] },
      },
      include: { payment: true },
    });

    // Calculate earnings
    const totalEarnings = orders.reduce((sum, order) => {
      return sum + (order.payment?.sellerAmount || 0);
    }, 0);

    // Get pending payouts (orders that haven't been paid out yet)
    const paidOutPayments = await prisma.payouts.findMany({
      where: { sellerId },
      select: { amount: true },
    });

    const totalPaidOut = paidOutPayments.reduce((sum, p) => sum + p.amount, 0);
    const pendingPayout = totalEarnings - totalPaidOut;

    // Get last payout
    const lastPayout = await prisma.payouts.findFirst({
      where: { sellerId },
      orderBy: { createdAt: "desc" },
    });

    // Get earnings by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentOrders = await prisma.orders.findMany({
      where: {
        shopId,
        status: { in: ["PAID", "DELIVERED"] },
        createdAt: { gte: sixMonthsAgo },
      },
      include: { payment: true },
      orderBy: { createdAt: "asc" },
    });

    const earningsByMonth: { period: string; amount: number }[] = [];
    const monthMap = new Map<string, number>();

    recentOrders.forEach((order) => {
      const month = order.createdAt.toISOString().slice(0, 7); // YYYY-MM
      const current = monthMap.get(month) || 0;
      monthMap.set(month, current + (order.payment?.sellerAmount || 0));
    });

    monthMap.forEach((amount, period) => {
      earningsByMonth.push({ period, amount });
    });

    return res.status(200).json({
      totalEarnings,
      pendingPayout: Math.max(0, pendingPayout),
      totalPaidOut,
      lastPayout: lastPayout
        ? {
          amount: lastPayout.amount,
          date: lastPayout.processedAt || lastPayout.createdAt,
          status: lastPayout.status,
        }
        : null,
      earningsByMonth,
      stripeOnboardingComplete: seller.stripeOnboardingComplete,
    });
  } catch (error) {
    return next(error);
  }
};

// Get seller payout history
export const getSellerPayouts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [payouts, total] = await Promise.all([
      prisma.payouts.findMany({
        where: { sellerId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.payouts.count({ where: { sellerId } }),
    ]);

    return res.status(200).json({
      payouts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return next(error);
  }
};

// Request a payout (manual trigger)
export const requestSellerPayout = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.user.id;
    const { amount } = req.body;

    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
      include: { shop: true },
    });

    if (!seller) {
      return res.status(404).json({ error: "Seller not found." });
    }

    if (!seller.stripeId) {
      return res.status(400).json({
        error: "Stripe account not connected. Please complete onboarding.",
      });
    }

    if (!seller.stripeOnboardingComplete) {
      return res.status(400).json({
        error: "Stripe onboarding incomplete. Please complete your account setup.",
      });
    }

    // Calculate available balance
    const shopId = seller.shop?.id;
    if (!shopId) {
      return res.status(400).json({ error: "No shop found." });
    }

    const orders = await prisma.orders.findMany({
      where: {
        shopId,
        status: { in: ["PAID", "DELIVERED"] },
      },
      include: { payment: true },
    });

    const totalEarnings = orders.reduce((sum, order) => {
      return sum + (order.payment?.sellerAmount || 0);
    }, 0);

    const paidOutPayments = await prisma.payouts.findMany({
      where: { sellerId },
      select: { amount: true },
    });

    const totalPaidOut = paidOutPayments.reduce((sum, p) => sum + p.amount, 0);
    const availableBalance = totalEarnings - totalPaidOut;

    const payoutAmount = amount || availableBalance;

    if (payoutAmount <= 0) {
      return res.status(400).json({ error: "No available balance for payout." });
    }

    if (payoutAmount > availableBalance) {
      return res.status(400).json({
        error: `Requested amount exceeds available balance of $${availableBalance.toFixed(2)}.`,
      });
    }

    // Minimum payout threshold
    if (payoutAmount < 10) {
      return res.status(400).json({
        error: "Minimum payout amount is $10.",
      });
    }

    try {
      // Create Stripe transfer to connected account
      const transfer = await stripe.transfers.create({
        amount: Math.round(payoutAmount * 100), // Convert to cents
        currency: "usd",
        destination: seller.stripeId,
        metadata: {
          sellerId,
          shopId,
        },
      });

      // Create payout record
      const payout = await prisma.payouts.create({
        data: {
          sellerId,
          stripeTransferId: transfer.id,
          amount: payoutAmount,
          currency: "usd",
          status: "PROCESSING",
          periodStart: sixMonthsAgo,
          periodEnd: new Date(),
        },
      });

      return res.status(200).json({
        success: true,
        payoutId: payout.id,
        stripeTransferId: transfer.id,
        amount: payoutAmount,
        status: "PROCESSING",
        estimatedArrival: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // ~2 days
      });
    } catch (stripeError: any) {
      console.error("Stripe transfer failed:", stripeError.message);
      return res.status(500).json({
        error: "Failed to process payout. Please try again later.",
      });
    }
  } catch (error) {
    return next(error);
  }
};

// Helper: Calculate date 6 months ago (used in requestSellerPayout)
const sixMonthsAgo = new Date();
sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
