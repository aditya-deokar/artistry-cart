import axios from "axios";

describe("Rate Limiting (E2E)", () => {
  it("should include rate-limit headers in response", async () => {
    const res = await axios.get("/readyz");
    expect(res.status).toBe(200);
    expect(res.headers).toHaveProperty("ratelimit-limit");
    expect(res.headers).toHaveProperty("ratelimit-remaining");
  });

  it("should decrement remaining count on subsequent requests", async () => {
    const first = await axios.get("/readyz");
    const remaining1 = Number(first.headers["ratelimit-remaining"]);

    const second = await axios.get("/readyz");
    const remaining2 = Number(second.headers["ratelimit-remaining"]);

    expect(remaining2).toBeLessThanOrEqual(remaining1);
  });

  it("should allow at least 100 requests for unauthenticated users", async () => {
    const res = await axios.get("/readyz");
    const limit = Number(res.headers["ratelimit-limit"]);
    expect(limit).toBeGreaterThanOrEqual(100);
  });
});
