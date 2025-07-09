const swaggerAutogen = require("swagger-autogen");

const doc ={
    info: {
        title: "Auth Service API",
        description: "Automatically generated Swagger docs",
        version: "1.0.0",

    },
    host: "localhost:6001",
    schemas: ["http"],
};

const outputFile = './apps/auth-service/src/swagger-output.json';
const endpointsFiles = ['./apps/auth-service/src/routes/auth.router.ts'];

swaggerAutogen()(outputFile, endpointsFiles, doc);