import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "../../../packages/error-handler/error-middelware";
import router from "./routes/auth.router";
import { oauthRouter } from "./oauth";

const host = process.env.HOST ?? "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 6001;

const app = express();

//  Correct CORS setup (withCredentials support)
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

//  Parse JSON & Cookies
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

//  Health check
app.get("/", (req, res) => {
  res.send({ message: "Hello API Auth Service" });
});

//  Auth routes
app.use("/api", router);

//  OAuth routes
app.use("/api/oauth", oauthRouter);

//  Global error handler
app.use(errorMiddleware);

//  Start server
const server = app.listen(port, host, () => {
  console.log(`🚀 Auth Service running at http://${host}:${port}/api`);

});

// ✅ Catch server-level errors
server.on("error", (err) => {
  console.error("❌ Server Error:", err);
});
