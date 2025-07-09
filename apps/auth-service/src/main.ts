import express from 'express';
import cors from 'cors';
import { errorMiddleware } from '../../../packages/error-handler/error-middelware';
import cookieParser from 'cookie-parser';
import router from './routes/auth.router';
import swaggerUi from 'swagger-ui-express';
const swaggerOutput = require('./swagger-output.json');


const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 6001;

const app = express();

app.use(cors({
  origin: ["http://localhost:3000"],
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send({ 'message': 'Hello API Auth Service'});
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerOutput))
app.get("/docs-json", (req, res)=> {
    res.json(swaggerOutput);
})

app.use("/api", router);
app.use(errorMiddleware);

const server = app.listen(port, ()=>{
    console.log(`Auth Service is Running at http://${host}:${port}/api`);
    console.log(`Swagger Docs Available at http://localhost:${port}/api-docs`);
});

server.on('error', (err)=>{
    console.log("Server Error:" , err);
})
