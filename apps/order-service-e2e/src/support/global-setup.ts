/**
 * Global Setup for Order Service E2E Tests
 *
 * Waits for the order service to be available before running tests.
 * Start the service first: npx nx serve order-service
 */
export default async function setup() {
  const host = process.env.HOST ?? 'localhost';
  const port = process.env.PORT ? Number(process.env.PORT) : 6004;

  console.log(`\n⏳ Waiting for order-service at ${host}:${port}...\n`);

  const maxWait = 30_000;
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    try {
      const res = await fetch(`http://${host}:${port}/`);
      if (res.ok) {
        console.log('✅ Order service is ready\n');
        return;
      }
    } catch { /* not ready yet */ }
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error(`Order service not available at ${host}:${port} after ${maxWait}ms`);
}
