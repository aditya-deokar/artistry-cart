/**
 * Global Setup for Product Service E2E Tests
 *
 * Waits for the product service to be available before running tests.
 * Start the service first: npx nx serve product-service
 */
export default async function setup() {
  const host = process.env.HOST ?? 'localhost';
  const port = process.env.PORT ? Number(process.env.PORT) : 6002;

  console.log(`\n⏳ Waiting for product-service at ${host}:${port}...\n`);

  // Poll until service is ready (max 30s)
  const maxWait = 30_000;
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    try {
      const res = await fetch(`http://${host}:${port}/`);
      if (res.ok) {
        console.log('✅ Product service is ready\n');
        return;
      }
    } catch { /* not ready yet */ }
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error(`Product service not available at ${host}:${port} after ${maxWait}ms`);
};

