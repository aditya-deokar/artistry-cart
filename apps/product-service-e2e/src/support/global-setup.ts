export default async function setup() {
  const baseUrl = process.env.PRODUCT_SERVICE_URL ?? 'http://localhost:6002';
  const readyUrl = new URL('/readyz', `${baseUrl}/`).toString();

  console.log(`\nWaiting for product-service at ${readyUrl}...\n`);

  const maxWait = 30_000;
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    try {
      const res = await fetch(readyUrl);
      if (res.ok) {
        console.log('Product service is ready\n');
        return;
      }
    } catch {
      // not ready yet
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Product service not available at ${readyUrl} after ${maxWait}ms`);
}
