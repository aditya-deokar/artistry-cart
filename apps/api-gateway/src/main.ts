import initializeConfig from "./libs/initializeSiteConfig";
import {
  closeServer,
  createLogger,
  registerGracefulShutdown,
} from "@artistry-cart/utils/runtime";
import { createGatewayApp } from "./app";
import { getGatewayConfig } from "./config";

const config = getGatewayConfig();
const logger = createLogger("api-gateway");
const app = createGatewayApp(config, logger);

const server = app.listen(config.port, config.host, () => {
  logger.info("API gateway listening", {
    host: config.host,
    port: config.port,
    upstreams: config.upstreams,
  });

  void initializeConfig()
    .then(() => {
      logger.info("Site config initialized successfully");
    })
    .catch((error) => {
      logger.error("Failed to initialize site config", { error });
    });
});

server.on("error", (error) => {
  logger.error("Server error", { error });
});

registerGracefulShutdown({
  name: "api-gateway",
  logger,
  close: () => closeServer(server),
});
