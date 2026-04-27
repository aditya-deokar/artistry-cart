import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import Stripe from "stripe";

import { errorMiddleware } from "../../../packages/error-handler/error-middelware";
import {
  closeServer,
  createCorsOptions,
  getHost,
  getPort,
  registerGracefulShutdown,
  registerHealthEndpoints,
} from "../../../packages/utils/runtime";
import router from "./routes/order.route";
import {
  handlePaymentSucceeded,
  handlePaymentFailed,
  handleChargeRefunded,
  handleAccountUpdated,
  handleTransferCreated,
} from "./controllers/order.controller";

const stripe = new Stripe(process.env.STRIPE_SECRETE_KEY!, {
  apiVersion: "2025-06-30.basil",
});

const host = getHost();
const port = getPort(6004);
const app = express();

app.use(
  cors(
    createCorsOptions({
      allowedHeaders: ["Authorization", "Content-Type"],
    }),
  ),
);

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
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case "payment_intent.succeeded":
          await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
          console.log("Payment succeeded - processed by handlePaymentSucceeded");
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
  },
);

app.use(express.json());
app.use(cookieParser());

const { liveness, readiness } = registerHealthEndpoints(app, {
  serviceName: "order-service",
});

app.get("/", (_req, res) => {
  res.send({ message: "Welcome to order-service!" });
});

app.get("/health", liveness);
app.get("/ready", readiness);

app.use("/order/api", router);
app.use(errorMiddleware);

const server = app.listen(port, host, () => {
  console.log(`Order service listening at http://${host}:${port}`);
});

server.on("error", console.error);

registerGracefulShutdown({
  name: "order-service",
  close: () => closeServer(server),
});
