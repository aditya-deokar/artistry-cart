import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { errorMiddleware } from "../../../packages/error-handler/error-middelware";
import {
  closeServer,
  createCorsOptions,
  getHost,
  getPort,
  registerGracefulShutdown,
  registerHealthEndpoints,
} from "../../../packages/utils/runtime";
import router from "./routes/auth.router";
import { oauthRouter } from "./oauth";

const host = getHost();
const port = getPort(6001);

const app = express();

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
  console.log(`Auth Service running at http://${host}:${port}/api`);
});

server.on("error", (err) => {
  console.error("Server Error:", err);
});

registerGracefulShutdown({
  name: "auth-service",
  close: () => closeServer(server),
});
