# Mock Interview Answers And Practice Drills

## Practice Rule

Practice out loud.

Reading silently is not enough.

Your goal is to sound:

- clear
- calm
- specific
- honest
- structured
- not memorized

## Drill 1: 30-Second Project Pitch

Prompt:

```text
Tell me about your project briefly.
```

Target:

- 4 to 6 sentences
- product context
- architecture shape
- one strong decision
- one honest tradeoff

## Drill 2: 2-Minute Architecture Story

Prompt:

```text
Walk me through the architecture.
```

Target:

- user surfaces
- gateway
- services
- data
- async
- AI
- tradeoff
- next improvement

## Drill 3: Tradeoff Answer

Prompt:

```text
Why not separate databases per service?
```

Answer pattern:

> Separate databases would improve service autonomy, but they would add migration, synchronization, and operational complexity before the ownership boundaries fully justify it. I used shared MongoDB/Prisma for speed and typed access, while documenting that data ownership is a future maturity area.

## Drill 4: Failure Answer

Prompt:

```text
What happens if Kafka is down?
```

Answer pattern:

> Foreground commerce should not depend directly on Kafka availability for core correctness. Analytics may lag or fail to publish, depending on producer fallback and outbox behavior. The user-facing path should degrade, and operations should alert on producer errors, queue lag, and worker failures.

## Drill 5: Production Readiness

Prompt:

```text
Is this production ready?
```

Answer pattern:

> It has production-oriented foundations: CI/CD, Docker, Kubernetes manifests, health/readiness checks, metrics, security headers, and deployment workflows. I would not overclaim full production maturity. The next steps are central observability, tracing, backup/restore runbooks, stronger secrets lifecycle, and broader coverage for AI/Kafka/frontend paths.

## Drill 6: Most Interesting Decision

Prompt:

```text
What is the most interesting technical decision?
```

Answer pattern:

> The Kafka analytics pipeline is one of the strongest decisions because it solves a real latency and decoupling problem. User behavior becomes recommendation-ready data without forcing browse or checkout flows to wait on analytics materialization.

## Drill 7: AI Story

Prompt:

```text
How does AI fit into the product?
```

Answer pattern:

> AI Vision lets users generate, refine, search, save, and collaborate around product concepts. It is connected to real marketplace objects like concepts, products, artisans, and collections. Technically, it is isolated in its own service because AI has different latency, cost, provider, media, and background job concerns.

## Drill 8: Senior Reflection

Prompt:

```text
What did this project teach you?
```

Answer pattern:

> It taught me that architecture is not just decomposition. Splitting services is easier than making contracts, ownership, observability, and operations mature. The strongest systems are honest about tradeoffs and have a clear path for evolution.

## Self-Review Checklist

After each answer, ask:

- Did I answer the question directly?
- Did I explain why, not only what?
- Did I mention a tradeoff?
- Did I avoid overclaiming?
- Did I connect to user or business value?
- Did I give a next improvement?
- Could I point to proof in the repo?

## Weekly Practice Plan

Day 1:

- 30-second and 2-minute pitch

Day 2:

- monorepo, shared database, gateway tradeoffs

Day 3:

- Kafka and recommendation stories

Day 4:

- AI Vision and payment stories

Day 5:

- DevOps, Kubernetes, observability stories

Day 6:

- behavioral STAR stories

Day 7:

- mock full interview, record yourself, tighten rambling

## Final Rule

Do not try to sound like a perfect architect.

Sound like a thoughtful engineer who can build, explain, evaluate, and improve real systems.
