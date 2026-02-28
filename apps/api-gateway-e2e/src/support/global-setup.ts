/**
 * Global Setup for API Gateway E2E Tests
 *
 * Waits for the gateway to be available before running tests.
 * Start the service first: npx nx serve api-gateway
 */
export default async function setup() {
  const host = process.env.HOST ?? 'localhost';
  const port = process.env.PORT ? Number(process.env.PORT) : 8080;

  console.log(`\n⏳ Waiting for api-gateway at ${host}:${port}...\n`);

  const maxWait = 30_000;
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    try {
      const res = await fetch(`http://${host}:${port}/gateway-health`);
      if (res.ok) {
        console.log('✅ API Gateway is ready\n');
        return;
      }
    } catch { /* not ready yet */ }
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error(`API Gateway not available at ${host}:${port} after ${maxWait}ms`);
}

