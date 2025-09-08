import express from 'express';
import "./jobs/product-cron.job"
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from '../../../packages/error-handler/error-middelware';
import productRouter from './routes/product.route';
import eventRouter from './routes/events.route';      
import discountRouter from './routes/discounts.route'; 

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 6002;

const app = express();

app.use(cors({
  origin: ["http://localhost:3000"],
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: true,
}));

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(cookieParser());

// Health check
app.get('/', (req, res) => {
  res.send({ message: 'Hello API Products Service' });
});

// Routes
app.use("/api", productRouter);
app.use("/api/events", eventRouter);     
app.use("/api/discounts", discountRouter); 

app.use(errorMiddleware);

const server = app.listen(port, () => {
  console.log(`Product Service is Running at http://${host}:${port}/api`);
});

server.on('error', (err) => {
  console.log("Server Error:", err);
});
