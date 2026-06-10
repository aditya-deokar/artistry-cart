# Interview Questions And Answer Patterns

This file gives interview-ready answers for senior-level architecture thinking.

## Question: What Makes Architecture Senior-Level?

Strong answer:

> Senior architecture is about judgment under constraints. It means choosing designs that fit product goals, team maturity, scale, reliability needs, and cost, while making tradeoffs explicit and preserving future options. It is not about adding the most complex tools.

## Question: How Do You Avoid Overengineering?

Strong answer:

> I start with the simplest design that satisfies the current requirements while preserving clean boundaries. I add complexity only when it buys something concrete like independent scaling, failure isolation, lower latency, stronger ownership, or better operability.

## Question: How Do You Evaluate A Tradeoff?

Strong answer:

> I ask what the choice improves, what it costs, how reversible it is, what risks it creates, who owns it, and what signal would make us revisit it. A good tradeoff is explicit, not hidden.

## Question: How Do You Think About Ownership?

Strong answer:

> Ownership means a team or service is accountable for behavior, data, contracts, operations, and documentation. Without ownership, boundaries are mostly cosmetic because changes still require unclear coordination.

## Question: How Do You Manage Shared Libraries?

Strong answer:

> Shared libraries should hold stable cross-cutting infrastructure like logging, middleware, clients, and test utilities. I avoid putting domain logic in broad shared packages because that creates hidden coupling and a large blast radius.

## Question: How Do You Handle Technical Debt?

Strong answer:

> I separate intentional debt from accidental debt. Intentional debt can be acceptable if it buys speed and has a known owner, risk, and revisit trigger. I prioritize repayment based on impact, likelihood, blast radius, detectability, and whether it blocks future change.

## Question: How Do You Evolve Architecture Without A Rewrite?

Strong answer:

> I prefer incremental migration. First I make ownership and contracts explicit, then add tests and observability, then migrate one boundary at a time. For data changes I use expand-and-contract. For service extraction I stabilize the API and data ownership before moving runtime deployment.

## Question: Why Use ADRs?

Strong answer:

> ADRs preserve decision reasoning. Code shows what exists, but ADRs explain why it was chosen, what alternatives were considered, what tradeoffs were accepted, and what follow-up work remains.

## Question: What Is The Most Senior Decision In Artistry Cart?

Strong answer:

> The strongest signal is knowing where complexity is justified and where it is not. Kafka is used where async analytics improves foreground latency. AI Vision is isolated because it has different runtime behavior. But the system stays pragmatic with an Nx monorepo and shared MongoDB/Prisma because strict purity would add coordination cost too early.

## Question: Is Artistry Cart Real Microservices?

Strong answer:

> I would not call it pure microservices. I would call it a service-oriented monorepo. It has real application and runtime boundaries, but persistence is shared through MongoDB and Prisma. That is intentional for the project stage, and the maturity path is clearer data ownership and stronger service contracts.

## Question: What Would You Improve First?

Strong answer:

> I would improve operational consistency first: service contracts, model ownership, validation conventions, central observability, distributed tracing, CI coverage for AI and Kafka paths, and backup/restore runbooks. Those changes reduce risk without requiring a full redesign.

## Question: How Do You Know When To Split A Service?

Strong answer:

> I split when the boundary has clear ownership, different scaling needs, different failure or security requirements, or independent delivery value. I avoid splitting only because the code is large. A bad split moves complexity into the network without reducing coupling.

## Best Short Project Pitch For This Topic

> Artistry Cart demonstrates stage-appropriate architecture judgment. It uses a monorepo for shared evolution, service boundaries for domain clarity, Kafka for real async value, a dedicated AI boundary for high-variance workflows, and Kubernetes/CI/observability for operational maturity. The honest tradeoff is shared persistence, and the roadmap is to tighten ownership, contracts, observability, and worker boundaries over time.
