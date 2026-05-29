import axios from "axios";

describe("Kafka service management surface", () => {
  it("exposes a liveness endpoint", async () => {
    const response = await axios.get("/healthz");

    expect(response.status).toBe(200);
    expect(response.data).toEqual(
      expect.objectContaining({
        service: "kafka-service",
        check: "liveness",
        status: "ok",
      }),
    );
  });

  it("exposes Prometheus-style metrics", async () => {
    const response = await axios.get("/metrics");

    expect(response.status).toBe(200);
    expect(response.data).toContain("app_info");
    expect(response.data).toContain("kafka_batches_total");
  });
});
