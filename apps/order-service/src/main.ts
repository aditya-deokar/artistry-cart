import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

import { errorMiddleware } from "@artistry-cart/error-handler/error-middelware";
import {
  closeServer,
  createCorsOptions,
  createLogger,
  getHost,
  getPort,
  registerGracefulShutdown,
  registerHealthEndpoints,
  setupHttpObservability,
} from "@artistry-cart/utils/runtime";
import router from "./routes/order.route";
import {
  createOrder,
} from "./controllers/order.controller";
import {
  startAnalyticsOutboxPublisher,
  stopAnalyticsOutboxPublisher,
} from "./services/analytics-outbox";

const host = getHost();
const port = getPort(6004);
const logger = createLogger("order-service");
const app = express();

setupHttpObservability(app, {
  serviceName: "order-service",
  logger,
});

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
    (req as typeof req & { rawBody?: Buffer }).rawBody = req.body as Buffer;

    return createOrder(req, res, (error) => {
      logger.error("Error processing webhook", { error });
      return res.status(500).json({ error: "Webhook handler failed" });
    });
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
  logger.info("Order service listening", { host, port });
});

server.on("error", (error) => {
  logger.error("Server error", { error });
});

void startAnalyticsOutboxPublisher().catch((error) => {
  logger.error("Failed to start analytics outbox publisher", { error });
});

registerGracefulShutdown({
  name: "order-service",
  logger,
  onShutdown: () => stopAnalyticsOutboxPublisher(),
  close: () => closeServer(server),
});
