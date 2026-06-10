# What Is A Microservice

## Simple Definition

A microservice is an independently runnable service focused on one business or technical capability.

It usually has:

- its own process
- its own API or message interface
- its own deployment unit
- its own health checks
- its own logs and metrics
- a clear responsibility

The word "micro" does not mean tiny. It means the service has a focused boundary.

## First-Principles Definition

A service exists to protect a responsibility.

You create a separate service when that part of the system:

- changes for different reasons
- scales for different reasons
- fails for different reasons
- has different security needs
- has different dependencies
- needs separate team ownership
- needs independent deployment

## Microservice Versus Module

A module is code organization inside an application.

A microservice is a running application boundary.

Module:

```text
same process
same deployment
function/class/module calls
```

Microservice:

```text
separate process
separate deployment unit
network or message communication
```

## Microservice Versus Monolith

Monolith:

```text
one backend application
one deployment unit
internal function calls
usually simpler operations
```

Microservices:

```text
many backend services
many deployment units
network/event communication
more operational complexity
```

Microservices are not automatically better. They are a tradeoff.

## What A Microservice Should Own

A strong service owns:

- a capability
- API contracts
- business rules for that capability
- persistence or at least data ownership rules
- operational health
- tests for its behavior

Example:

```text
order-service owns order creation, checkout state, payment webhooks, and seller order views.
```

## What A Microservice Is Not

A microservice is not simply:

- a folder
- a controller
- a route group
- a package
- a small file
- a deployment label

If two services cannot change independently and share all internals, they may only be folder boundaries.

## Why Teams Use Microservices

Benefits:

- independent deployment
- independent scaling
- clearer ownership
- failure isolation
- smaller codebases per service
- technology flexibility
- domain-focused teams

Costs:

- network failures
- harder debugging
- data consistency complexity
- distributed transactions are difficult
- more DevOps work
- harder local development
- API versioning and contract management

## Interview Explanation

If asked "What is a microservice?", say:

> A microservice is an independently runnable service focused on a specific business capability. It owns its API and behavior, can be deployed and scaled separately, and communicates with other services over the network or through events. The benefit is independence and clearer ownership; the cost is distributed system complexity.

## Connection To Artistry Cart

Artistry Cart service examples:

- `auth-service`: identity and auth
- `product-service`: catalog, shops, search, pricing, discounts, events
- `order-service`: checkout, orders, Stripe payments, webhooks
- `recommendation-service`: recommendation APIs
- `aivision-service`: AI-heavy workflows
- `kafka-service`: analytics event consumption

