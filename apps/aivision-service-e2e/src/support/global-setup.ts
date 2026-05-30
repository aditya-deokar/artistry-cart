export default async function setup() {
  const baseUrl = process.env.AIVISION_SERVICE_URL ?? 'http://localhost:6006';
  const readyUrl = new URL('/readyz', `${baseUrl}/`).toString();

  console.log(`\nWaiting for aivision-service at ${readyUrl}...\n`);

  const maxWait = 30_000;
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    try {
      const res = await fetch(readyUrl);
      if (res.ok) {
        console.log('AI Vision service is ready\n');
        return;
      }
    } catch {
      // not ready yet
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`AI Vision service not available at ${readyUrl} after ${maxWait}ms`);
}
