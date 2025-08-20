import express from 'express';
import "./jobs/product-cron.job"
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from '../../../packages/error-handler/error-middelware';
import router from './routes/product.route';





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


app.use("/api", router);
app.use(errorMiddleware);

const server = app.listen(port, () => {
  console.log(`Product Service is Running at http://${host}:${port}/api`);
});

server.on('error', (err) => {
  console.log("Server Error:", err);
});
