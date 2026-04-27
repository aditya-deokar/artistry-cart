import axios from "axios";

describe("GET /readyz", () => {
  it("should return gateway readiness", async () => {
    const res = await axios.get("/readyz");
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty("service", "api-gateway");
  });
});
