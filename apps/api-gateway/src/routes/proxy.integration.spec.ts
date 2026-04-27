import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

interface ProxyCall {
  host: string;
  opts?: Record<string, unknown>;
}

const proxyCalls: ProxyCall[] = [];

vi.mock("express-http-proxy", () => ({
  __esModule: true,
  default: vi.fn((host: string, opts?: Record<string, unknown>) => {
    proxyCalls.push({ host, opts });
    return (req: any, res: any) => {
      let resolvedPath = req.originalUrl;
      if (typeof opts?.proxyReqPathResolver === "function") {
        resolvedPath = (opts.proxyReqPathResolver as (request: any) => string)(req);
      }

      res.status(200).json({
        proxied: true,
        upstream: host,
        path: resolvedPath,
        method: req.method,
      });
    };
  }),
}));

describe("api-gateway runtime config", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    proxyCalls.length = 0;
    process.env = {
      ...originalEnv,
      CORS_ALLOWED_ORIGINS: "http://localhost:3000,http://localhost:3001",
      AUTH_SERVICE_URL: "http://auth-service:6001",
      PRODUCT_SERVICE_URL: "http://product-service:6002",
      ORDER_SERVICE_URL: "http://order-service:6004",
      RECOMMENDATION_SERVICE_URL: "http://recommendation-service:6005",
      AIVISION_SERVICE_URL: "http://aivision-service:6006",
    };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  async function buildGatewayApp() {
    const [{ createGatewayApp }, { getGatewayConfig }] = await Promise.all([
      import("../app.js"),
      import("../config.js"),
    ]);

    return createGatewayApp(getGatewayConfig());
  }

  it("registers healthz and readyz endpoints", async () => {
    const app = await buildGatewayApp();

    const health = await request(app).get("/healthz");
    expect(health.status).toBe(200);
    expect(health.body).toMatchObject({
      service: "api-gateway",
      status: "ok",
      check: "liveness",
    });

    const ready = await request(app).get("/readyz");
    expect(ready.status).toBe(200);
    expect(ready.body).toMatchObject({
      service: "api-gateway",
      status: "ok",
      check: "readiness",
    });
  });

  it("keeps the legacy /gateway-health route available", async () => {
    const app = await buildGatewayApp();

    const res = await request(app).get("/gateway-health");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      message: "Welcome to api-gateway!",
      service: "api-gateway",
      status: "ok",
    });
  });

  it("uses env-driven upstream URLs", async () => {
    const app = await buildGatewayApp();

    const authRes = await request(app).get("/auth/api/me");
    expect(authRes.status).toBe(200);
    expect(authRes.body.upstream).toBe("http://auth-service:6001");

    const productRes = await request(app).get("/product/api/products");
    expect(productRes.body.upstream).toBe("http://product-service:6002");

    const orderRes = await request(app).get("/order/api/orders/ord-1");
    expect(orderRes.body.upstream).toBe("http://order-service:6004");
    expect(orderRes.body.path).toBe("/order/api/orders/ord-1");

    const recommendationRes = await request(app).get("/recommendation/api/recommend");
    expect(recommendationRes.body.upstream).toBe("http://recommendation-service:6005");

    const aiRes = await request(app).get("/ai-vision/api/analyze");
    expect(aiRes.body.upstream).toBe("http://aivision-service:6006");
  });

  it("applies CORS from CORS_ALLOWED_ORIGINS", async () => {
    const app = await buildGatewayApp();

    const allowed = await request(app)
      .options("/healthz")
      .set("Origin", "http://localhost:3000")
      .set("Access-Control-Request-Method", "GET");

    expect(allowed.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
    expect(allowed.headers["access-control-allow-credentials"]).toBe("true");

    const blocked = await request(app)
      .options("/healthz")
      .set("Origin", "http://evil.example")
      .set("Access-Control-Request-Method", "GET");

    expect(blocked.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("returns rate-limit headers on readiness responses", async () => {
    const app = await buildGatewayApp();

    const res = await request(app).get("/readyz");
    expect(res.status).toBe(200);
    expect(res.headers).toHaveProperty("ratelimit-limit");
    expect(res.headers).toHaveProperty("ratelimit-remaining");
  });

  it("returns a JSON 404 for unmatched routes", async () => {
    const app = await buildGatewayApp();

    const res = await request(app).get("/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Not found" });
  });

  it("registers the order proxy with proxyReqPathResolver", async () => {
    await buildGatewayApp();

    const orderProxy = proxyCalls.find((call) => call.host === "http://order-service:6004");
    expect(orderProxy?.opts).toBeDefined();
    expect(orderProxy?.opts?.proxyReqPathResolver).toBeTypeOf("function");
  });
});
