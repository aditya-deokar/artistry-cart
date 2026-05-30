export default async function setup() {
  const baseUrl = process.env.ORDER_SERVICE_URL ?? 'http://localhost:6004';
  const readyUrl = new URL('/readyz', `${baseUrl}/`).toString();

  console.log(`\nWaiting for order-service at ${readyUrl}...\n`);

  const maxWait = 30_000;
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    try {
      const res = await fetch(readyUrl);
      if (res.ok) {
        console.log('Order service is ready\n');
        return;
      }
    } catch {
      // not ready yet
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Order service not available at ${readyUrl} after ${maxWait}ms`);
}
