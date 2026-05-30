export default async function setup() {
  const baseUrl = process.env.RECOMMENDATION_SERVICE_URL ?? "http://localhost:6005";
  const readyUrl = new URL("/readyz", `${baseUrl}/`).toString();

  console.log(`\nWaiting for recommendation-service at ${readyUrl}...\n`);

  const maxWait = 30_000;
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    try {
      const res = await fetch(readyUrl);
      if (res.ok) {
        console.log("Recommendation service is ready\n");
        return;
      }
    } catch {
      // not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Recommendation service not available at ${readyUrl} after ${maxWait}ms`);
}
