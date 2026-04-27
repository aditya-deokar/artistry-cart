import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import {
  closeServer,
  createCorsOptions,
  getHost,
  getPort,
  registerGracefulShutdown,
  registerHealthEndpoints,
} from "../../../packages/utils/runtime";
import router from "./routes/recommendation.routes";

const app = express();
const host = getHost();
const port = getPort(6005);

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
  console.log(`Listening at http://${host}:${port}/api`);
});

server.on("error", console.error);

registerGracefulShutdown({
  name: "recommendation-service",
  close: () => closeServer(server),
});
