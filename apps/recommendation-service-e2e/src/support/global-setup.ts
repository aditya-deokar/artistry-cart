export default async function setup() {
  const host = process.env.HOST ?? "localhost";
  const port = process.env.PORT ? Number(process.env.PORT) : 6005;

  console.log(`\nWaiting for recommendation-service at ${host}:${port}...\n`);

  const maxWait = 30_000;
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    try {
      const res = await fetch(`http://${host}:${port}/readyz`);
      if (res.ok) {
        console.log("Recommendation service is ready\n");
        return;
      }
    } catch {
      // not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Recommendation service not available at ${host}:${port} after ${maxWait}ms`);
}
