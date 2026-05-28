import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import {
  closeServer,
  createCorsOptions,
  createLogger,
  getHost,
  getPort,
  registerGracefulShutdown,
  registerHealthEndpoints,
  setupHttpObservability,
} from "../../../packages/utils/runtime";
import router from "./routes/recommendation.routes";

const app = express();
const host = getHost();
const port = getPort(6005);
const logger = createLogger("recommendation-service");

setupHttpObservability(app, {
  serviceName: "recommendation-service",
  logger,
});

app.use(cors(createCorsOptions()));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cookieParser());

const { liveness, readiness } = registerHealthEndpoints(app, {
  serviceName: "recommendation-service",
});

app.get("/", (_req, res) => {
  res.send({ message: "Welcome to recommendation-service!" });
});

app.get("/health", liveness);
app.get("/ready", readiness);

app.use("/api", router);

const server = app.listen(port, host, () => {
  logger.info("Recommendation service listening", { host, port });
});

server.on("error", (error) => {
  logger.error("Server error", { error });
});

registerGracefulShutdown({
  name: "recommendation-service",
  logger,
  close: () => closeServer(server),
});
