import {
  getAllowedOrigins,
  getHost,
  getPort,
  getServiceUrl,
} from "@artistry-cart/utils/runtime";

export function getGatewayConfig() {
  return {
    host: getHost(),
    port: getPort(8080),
    corsAllowedOrigins: getAllowedOrigins(),
    upstreams: {
      auth: getServiceUrl("AUTH_SERVICE_URL", "http://localhost:6001"),
      product: getServiceUrl("PRODUCT_SERVICE_URL", "http://localhost:6002"),
      order: getServiceUrl("ORDER_SERVICE_URL", "http://localhost:6004"),
      recommendation: getServiceUrl(
        "RECOMMENDATION_SERVICE_URL",
        "http://localhost:6005",
      ),
      aiVision: getServiceUrl("AIVISION_SERVICE_URL", "http://localhost:6006"),
    },
  };
}

export type GatewayConfig = ReturnType<typeof getGatewayConfig>;
