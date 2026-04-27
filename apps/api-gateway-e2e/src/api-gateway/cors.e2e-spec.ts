import axios from "axios";

describe("CORS (E2E)", () => {
  it("should respond to OPTIONS preflight with CORS headers", async () => {
    const res = await axios.options("/readyz", {
      headers: {
        Origin: "http://localhost:3000",
        "Access-Control-Request-Method": "GET",
      },
    });

    expect(res.status).toBeLessThan(500);
    expect(res.headers).toHaveProperty("access-control-allow-origin");
  });

  it("should include credentials header when origin is allowed", async () => {
    const res = await axios.options("/readyz", {
      headers: {
        Origin: "http://localhost:3000",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type",
      },
    });

    expect(res.status).toBeLessThan(500);
    expect(res.headers["access-control-allow-credentials"]).toBe("true");
  });

  it("should list allowed methods in CORS response", async () => {
    const res = await axios.options("/readyz", {
      headers: {
        Origin: "http://localhost:3000",
        "Access-Control-Request-Method": "DELETE",
      },
    });

    const allowedMethods = res.headers["access-control-allow-methods"];
    expect(allowedMethods).toBeDefined();
    expect(allowedMethods).toMatch(/GET|POST|PUT|DELETE|PATCH/);
  });
});
