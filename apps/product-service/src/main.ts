import express from 'express';
import "./jobs/product-cron.job"
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from '../../../packages/error-handler/error-middelware';
import productRouter from './routes/product.route';
import eventRouter from './routes/events.route';      
import discountRouter from './routes/discounts.route';
import shopRouter from './routes/shop.route';
import searchRouter from './routes/search.route';
import offersRouter from './routes/offers.route';


const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 6002;

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:3001", // For admin panel
    process.env.FRONTEND_URL || "http://localhost:3000"
  ].filter(Boolean),
  allowedHeaders: ['Authorization', 'Content-Type', 'X-Requested-With', 'Accept'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(cookieParser());

// Health check with service info
app.get('/', (req, res) => {
  res.json({ 
    message: 'Products Service API',
    version: '2.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      products: '/api',
      events: '/api/events',
      discounts: '/api/discounts',
      shops: '/api/shops',
      search: '/api/search',
      offers: '/api/offers'
    }
  });
});

// API Routes
app.use("/api", productRouter);
app.use("/api/events", eventRouter);     
app.use("/api/discounts", discountRouter);
app.use("/api/shops", shopRouter);
app.use("/api/search", searchRouter);
app.use("/api/offers", offersRouter);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorMiddleware);

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
