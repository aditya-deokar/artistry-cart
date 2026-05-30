export default async function setup() {
  const baseUrl = process.env.API_GATEWAY_URL ?? "http://localhost:8080";
  const readyUrl = new URL("/readyz", `${baseUrl}/`).toString();

  console.log(`\nWaiting for api-gateway at ${readyUrl}...\n`);

  const maxWait = 30_000;
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    try {
      const res = await fetch(readyUrl);
      if (res.ok) {
        console.log("API Gateway is ready\n");
        return;
      }
    } catch {
      // not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`API Gateway not available at ${readyUrl} after ${maxWait}ms`);
}
