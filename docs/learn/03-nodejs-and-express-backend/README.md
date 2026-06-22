# Node.js And Express Backend

This folder is the third learning block for preparing for a bigger engineering role. It focuses on how backend APIs are built with Node.js and Express, and how to explain backend design clearly in interviews.

The goal is to move from "I can create routes" to "I understand how a production backend service is structured, secured, tested, observed, and operated."

## Learning Outcome

After completing this topic, you should be able to explain:

- what Node.js is and why it is used for backend services
- how the Node.js event loop affects API performance
- how an Express request moves through middleware, routes, controllers, services, and error handlers
- how to structure a scalable Express service
- how to validate request input
- how centralized error handling works
- how logging, health checks, and readiness endpoints help operations
- how to build production-ready REST APIs
- how Node/Express appears in the Artistry Cart services

## Files In This Topic

1. [Node.js Runtime For Backend Engineers](./01-nodejs-runtime-for-backend-engineers.md)
2. [Express Fundamentals And Request Lifecycle](./02-express-fundamentals-and-request-lifecycle.md)
3. [Routes, Controllers, Services, And Repositories](./03-routes-controllers-services-repositories.md)
4. [Middleware Pipeline And Cross-Cutting Concerns](./04-middleware-pipeline-and-cross-cutting-concerns.md)
5. [Validation, DTOs, And Request Contracts](./05-validation-dtos-and-request-contracts.md)
6. [Centralized Error Handling And Logging](./06-centralized-error-handling-and-logging.md)
7. [Health Checks, Configuration, And Production API Readiness](./07-health-checks-configuration-production-readiness.md)
8. [Interview Questions And Answer Patterns](./08-interview-questions-and-answer-patterns.md)

## How To Study This Topic

Read the lifecycle files first. Express becomes easy once you understand that a request is passed through a chain:

```text
request
  -> global middleware
  -> route middleware
  -> controller
  -> service
  -> database/external API
  -> response
  -> error middleware if something fails
```

For interviews, always connect implementation details to engineering reasons:

- middleware exists to reuse cross-cutting behavior
- controllers keep HTTP concerns separate
- services hold business logic
- validation protects the system boundary
- centralized errors make APIs consistent
- health checks support deployment and operations

## Connection To Artistry Cart

This repo uses Express backend services for:

- `apps/api-gateway`
- `apps/auth-service`
- `apps/product-service`
- `apps/order-service`
- `apps/recommendation-service`
- `apps/aivision-service`
- `apps/kafka-service` management/health behavior

Shared backend concerns live in:

- `packages/error-handler`
- `packages/middleware`
- `packages/libs/prisma`
- `packages/libs/redis`
- `packages/utils/kafka`
- `packages/test-utils`

