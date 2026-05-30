export default async function setup() {
  const baseUrl = process.env.KAFKA_SERVICE_URL ?? 'http://localhost:3000';
  const readyUrl = new URL('/healthz', `${baseUrl}/`).toString();

  console.log(`\nWaiting for kafka-service at ${readyUrl}...\n`);

  const maxWait = 30_000;
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    try {
      const res = await fetch(readyUrl);
      if (res.ok) {
        console.log('Kafka service is ready\n');
        return;
      }
    } catch {
      // not ready yet
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Kafka service not available at ${readyUrl} after ${maxWait}ms`);
}
