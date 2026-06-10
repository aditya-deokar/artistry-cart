# Monolith

## What Is A Monolith

A monolith is an application deployed and run as one unit.

Typical shape:

```text
controllers
services
repositories
domain logic
database access
background jobs
  -> one application process/deployable
```

The code may still be organized into folders and modules, but runtime deployment is one unit.

## Simple Example

```text
ecommerce-backend
  /auth
  /products
  /orders
  /payments
  /recommendations
```

Everything builds and deploys together as one backend app.

## Benefits

### Simpler Deployment

One backend to deploy.

### Easier Local Development

Usually fewer services to start.

### Easier Transactions

One app and one database make transactions simpler.

### Easier Debugging At Small Scale

Function calls stay in one process. Logs are often in one place.

### Faster Early Product Development

When the domain is still changing, a monolith avoids premature service boundaries.

## Costs

### Coarse Scaling

You scale the whole app, even if only one area needs more resources.

### Larger Codebase Over Time

Without internal boundaries, a monolith can become hard to understand.

### All-Or-Nothing Deployment

Small changes require redeploying the whole app.

### Failure Blast Radius

A severe bug or resource issue in one area can affect the whole backend.

### Team Coordination

As teams grow, many people may touch the same deployable.

## Monolith Is Not Bad

Many successful systems start as monoliths.

A monolith is often the right choice when:

- the product is early
- the team is small
- domain boundaries are unclear
- operational simplicity matters
- traffic is moderate
- fast iteration is more important than independent scaling

## Bad Monolith Versus Good Monolith

Bad monolith:

```text
everything depends on everything
no module boundaries
business rules scattered everywhere
hard to test
hard to deploy safely
```

Good monolith:

```text
clear modules
good tests
clean domain boundaries
well-structured database access
single simple deployment
```

## Interview Explanation

If asked "What is a monolith?", say:

> A monolith is an application deployed as one unit. It can be very productive and operationally simple, especially early in a product, because local development, transactions, and deployment are simpler. The downside is that as it grows, scaling, ownership, deployments, and failure isolation become harder unless internal boundaries are disciplined.

## Connection To Artistry Cart

Artistry Cart is not a single backend monolith because it has separate backend services such as:

- `auth-service`
- `product-service`
- `order-service`
- `recommendation-service`
- `aivision-service`
- `api-gateway`
- `kafka-service`

However, shared Prisma/MongoDB means some monolith-like data coupling still exists.

