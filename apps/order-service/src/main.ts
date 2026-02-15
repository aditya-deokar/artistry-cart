import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { errorMiddleware } from "../../../packages/error-handler/error-middelware";
import router from "./routes/order.route";
import {
  createOrder,
  handlePaymentFailed,
  handleChargeRefunded,
  handleAccountUpdated,
  handleTransferCreated,
} from "./controllers/order.controller";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRETE_KEY!, {
  apiVersion: "2025-06-30.basil",
});

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000", // frontend dev
      "http://localhost:3001", // seller-ui dev
      process.env.FRONTEND_URL || "", // allow env-based frontend
    ].filter(Boolean),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true, // allow cookies
  })
);

// ============================================
// STRIPE WEBHOOK HANDLER (before express.json())
// ============================================
app.post(
  "/order/api/webhooks",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["stripe-signature"];
    if (!signature) {
      return res.status(400).send("Missing Stripe signature");
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle different event types
    try {
      switch (event.type) {
        case "payment_intent.succeeded":
          // Handled by createOrder (legacy endpoint)
          console.log("Payment succeeded - processed by /create-order");
          break;

        case "payment_intent.payment_failed":
          await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        case "charge.refunded":
          await handleChargeRefunded(event.data.object as Stripe.Charge);
          break;

        case "account.updated":
          await handleAccountUpdated(event.data.object as Stripe.Account);
          break;

        case "transfer.created":
          await handleTransferCreated(event.data.object as Stripe.Transfer);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return res.status(200).json({ received: true });
    } catch (error) {
      console.error("Error processing webhook:", error);
      return res.status(500).json({ error: "Webhook handler failed" });
    }
  }
);

// Legacy webhook endpoint for payment_intent.succeeded
app.post(
  "/order/api/create-order",
  bodyParser.raw({ type: "application/json" }),
  (req, res, next) => {
    (req as any).rawBody = req.body;
    next();
  },
  createOrder
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send({ message: "Welcome to order-service!" });
});

// Routes
app.use("/order/api", router);

app.use(errorMiddleware);
const port = process.env.PORT || 6004;
const server = app.listen(port, () => {
  console.log(`Order service listening at http://localhost:${port}`);
});
server.on("error", console.error);
