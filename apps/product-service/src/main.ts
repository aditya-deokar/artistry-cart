import app from "./app";
import {
  closeServer,
  createLogger,
  getHost,
  getPort,
  registerGracefulShutdown,
} from "@artistry-cart/utils/runtime";
import { registerProductCleanupCron } from "./jobs/product-cron.job";

const host = getHost();
const port = getPort(6002);
const logger = createLogger("product-service");

registerProductCleanupCron(logger);

const server = app.listen(port, host, () => {
  logger.info("Product service listening", { host, port });
});

server.on("error", (err) => {
  logger.error("Server error", { error: err });
});

registerGracefulShutdown({
  name: "product-service",
  logger,
  close: () => closeServer(server),
});
