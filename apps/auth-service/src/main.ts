import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

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
import router from "./routes/auth.router";
import { oauthRouter } from "./oauth";

const host = getHost();
const port = getPort(6001);
const logger = createLogger("auth-service");

const app = express();

setupHttpObservability(app, {
  serviceName: "auth-service",
  logger,
});

app.use(
  cors(
    createCorsOptions({
      allowedHeaders: ["Authorization", "Content-Type"],
    }),
  ),
);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

const { liveness, readiness } = registerHealthEndpoints(app, {
  serviceName: "auth-service",
});

app.get("/", (_req, res) => {
  res.send({ message: "Hello API Auth Service" });
});

app.get("/health", liveness);
app.get("/ready", readiness);

app.use("/api", router);
app.use("/api/oauth", oauthRouter);
app.use(errorMiddleware);

const server = app.listen(port, host, () => {
  logger.info("Auth service listening", { host, port });
});

server.on("error", (err) => {
  logger.error("Server error", { error: err });
});

registerGracefulShutdown({
  name: "auth-service",
  logger,
  close: () => closeServer(server),
});
