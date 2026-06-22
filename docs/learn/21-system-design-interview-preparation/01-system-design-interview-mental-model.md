# System Design Interview Mental Model

## What A System Design Interview Tests

System design interviews test how you think about building real systems.

They are not only testing whether you know tools like Kafka, Redis, Kubernetes, or MongoDB.

They test whether you can:

- clarify an ambiguous problem
- identify users and workflows
- define requirements
- estimate scale
- choose components intentionally
- draw service boundaries
- model data
- handle failures
- discuss tradeoffs
- communicate clearly
- adapt when constraints change

## The Main Interview Signal

The interviewer wants to know:

```text
can this person reason through a real engineering problem with judgment?
```

That means your answer should sound deliberate.

Do not say:

```text
I will use Kafka because Kafka is scalable.
```

Say:

```text
I would use Kafka only for workflows where durable async event processing helps, such as analytics or recommendation inputs. I would not put every request through Kafka because it adds eventual consistency and operational cost.
```

## The Standard Flow

A reliable answer flow:

1. Clarify the product goal.
2. Identify users and core workflows.
3. Define functional requirements.
4. Define non-functional requirements.
5. Estimate scale.
6. Propose APIs and data model.
7. Draw high-level architecture.
8. Deep dive the riskiest parts.
9. Discuss tradeoffs and failure modes.
10. Summarize improvements.

## Functional Requirements

Functional requirements describe what the system must do.

Examples:

- users can sign up and log in
- buyers can search products
- sellers can manage inventory
- users can place orders
- payment webhooks update order status
- analytics events feed recommendations

## Non-Functional Requirements

Non-functional requirements describe how well the system must work.

Examples:

- low latency
- high availability
- data consistency
- security
- scalability
- observability
- cost control
- compliance

System design interviews become senior-level when you discuss non-functional requirements well.

## Start Simple

Do not start with a giant distributed architecture.

Start with the simplest design that satisfies the requirements, then evolve it.

Good phrase:

```text
I would start with a simple baseline, then add complexity only where the requirements force it.
```

## Think In Boundaries

Important boundaries:

- user surfaces
- API boundary
- service boundary
- data ownership boundary
- async event boundary
- external provider boundary
- operational boundary

Most bad designs have blurry boundaries.

## Think In Tradeoffs

Every decision costs something.

Examples:

- microservices improve independent scaling but add distributed complexity
- cache improves latency but introduces staleness
- async events reduce foreground latency but introduce eventual consistency
- shared database speeds development but weakens service autonomy

Interviewers reward honest tradeoff thinking.

## Strong Interview Answer

If asked "How do you approach system design?", say:

> I start by clarifying the product goal, users, core workflows, and constraints. Then I define functional and non-functional requirements, estimate scale, design APIs and data models, draw a simple high-level architecture, and deep dive the risky parts like consistency, scale, reliability, and security. I explain tradeoffs as I go instead of just naming technologies.

## Artistry Cart Connection

Artistry Cart is useful because it shows this exact thinking: separate buyer and seller surfaces, a gateway, domain services, shared persistence for speed, Kafka where async processing helps, and AI Vision as a separate boundary because its runtime behavior differs from normal commerce APIs.
