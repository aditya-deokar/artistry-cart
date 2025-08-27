
import express from 'express';
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser"
import { errorMiddleware } from "../../../packages/error-handler/error-middelware"
import router from './routes/order.route';
const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000", // frontend dev
      process.env.FRONTEND_URL || "", // allow env-based frontend
    ].filter(Boolean),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true, // allow cookies
  })
);

app.use(express.json());
app.use(cookieParser())

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to order-service!' });
});

// Routes
app.use("/order/api", router)

app.use(errorMiddleware)
const port = process.env.PORT || 6004;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
