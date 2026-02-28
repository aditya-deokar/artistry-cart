/**
 * Global Setup for Recommendation Service E2E Tests
 *
 * Waits for the recommendation service to be available before running tests.
 * Start the service first: npx nx serve recommendation-service
 */
export default async function setup() {
  const host = process.env.HOST ?? 'localhost';
  const port = process.env.PORT ? Number(process.env.PORT) : 6005;

  console.log(`\n⏳ Waiting for recommendation-service at ${host}:${port}...\n`);

  const maxWait = 30_000;
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    try {
      const res = await fetch(`http://${host}:${port}/`);
      if (res.ok) {
        console.log('✅ Recommendation service is ready\n');
        return;
      }
    } catch { /* not ready yet */ }
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error(`Recommendation service not available at ${host}:${port} after ${maxWait}ms`);
}

