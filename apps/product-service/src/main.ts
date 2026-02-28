import "./jobs/product-cron.job"
import app from './app';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 6002;

const server = app.listen(port, () => {
  console.log(`🚀 Product Service is Running at http://${host}:${port}/api`);
  console.log(`📊 Health Check: http://${host}:${port}/`);
  console.log(`🛍️  Products API: http://${host}:${port}/api`);
  console.log(`🎉 Events API: http://${host}:${port}/api/events`);
  console.log(`💰 Discounts API: http://${host}:${port}/api/discounts`);
});

server.on('error', (err) => {
  console.error("❌ Server Error:", err);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
