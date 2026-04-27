import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { errorMiddleware } from "../../../packages/error-handler/error-middelware";
import {
  createCorsOptions,
  registerHealthEndpoints,
} from "../../../packages/utils/runtime";
import productRouter from "./routes/product.route";
import eventRouter from "./routes/events.route";
import discountRouter from "./routes/discounts.route";
import shopRouter from "./routes/shop.route";
import searchRouter from "./routes/search.route";
import offersRouter from "./routes/offers.route";

const app: Express = express();

app.use(cors(createCorsOptions()));

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(cookieParser());

const { liveness, readiness } = registerHealthEndpoints(app, {
  serviceName: "product-service",
});

app.get("/", (_req, res) => {
  res.json({
    message: "Products Service API",
    version: "2.0.0",
    status: "healthy",
    timestamp: new Date().toISOString(),
    endpoints: {
      products: "/api",
      events: "/api/events",
      discounts: "/api/discounts",
      shops: "/api/shops",
      search: "/api/search",
      offers: "/api/offers",
    },
  });
});

app.get("/health", liveness);
app.get("/ready", readiness);

app.use("/api", productRouter);
app.use("/api/events", eventRouter);
app.use("/api/discounts", discountRouter);
app.use("/api/shops", shopRouter);
app.use("/api/search", searchRouter);
app.use("/api/offers", offersRouter);

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

app.use(errorMiddleware);

export default app;
