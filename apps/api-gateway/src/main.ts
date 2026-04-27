import initializeConfig from "./libs/initializeSiteConfig";
import {
  closeServer,
  registerGracefulShutdown,
} from "../../../packages/utils/runtime";
import { createGatewayApp } from "./app";
import { getGatewayConfig } from "./config";

const config = getGatewayConfig();
const app = createGatewayApp(config);

const server = app.listen(config.port, config.host, () => {
  console.log(`Listening at http://${config.host}:${config.port}/api`);

  void initializeConfig()
    .then(() => {
      console.log("Site config initailized successfully!");
    })
    .catch((error) => {
      console.error("Failed to initailize site config:", error);
    });
});

server.on("error", console.error);

registerGracefulShutdown({
  name: "api-gateway",
  close: () => closeServer(server),
});
