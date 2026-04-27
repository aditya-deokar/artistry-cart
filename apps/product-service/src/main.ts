import "./jobs/product-cron.job";

import app from "./app";
import {
  closeServer,
  getHost,
  getPort,
  registerGracefulShutdown,
} from "../../../packages/utils/runtime";

const host = getHost();
const port = getPort(6002);

const server = app.listen(port, host, () => {
  console.log(`Product Service is running at http://${host}:${port}/api`);
  console.log(`Health Check: http://${host}:${port}/healthz`);
  console.log(`Products API: http://${host}:${port}/api`);
  console.log(`Events API: http://${host}:${port}/api/events`);
  console.log(`Discounts API: http://${host}:${port}/api/discounts`);
});

server.on("error", (err) => {
  console.error("Server Error:", err);
});

registerGracefulShutdown({
  name: "product-service",
  close: () => closeServer(server),
});
