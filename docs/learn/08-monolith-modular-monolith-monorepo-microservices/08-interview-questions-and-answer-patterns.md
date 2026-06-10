# Interview Questions And Answer Patterns

This file gives interview-ready answers for monolith, modular monolith, monorepo, and microservices.

## Question: What Is The Difference Between Monolith And Monorepo?

Strong answer:

> A monolith is a runtime and deployment architecture where the application is deployed as one unit. A monorepo is a source-code organization strategy where multiple projects live in one repository. They are different dimensions. A monorepo can contain a monolith or many microservices.

## Question: What Is A Monolith?

Strong answer:

> A monolith is an application deployed as one unit. It is often simpler to develop, test, deploy, and transact within, especially early on. The downside is that as it grows, scaling, deployment, team ownership, and failure isolation can become harder.

## Question: What Is A Modular Monolith?

Strong answer:

> A modular monolith is one deployable application with strong internal modules organized around domains or capabilities. It keeps operational simplicity while improving maintainability and creating a future path to service extraction.

## Question: What Is A Monorepo?

Strong answer:

> A monorepo is one repository containing multiple projects such as apps, services, packages, tests, docs, and infrastructure. It helps with shared tooling, atomic changes, and refactoring, but needs tools like Nx and clear boundaries to avoid slow CI and hidden coupling.

## Question: What Are Microservices?

Strong answer:

> Microservices are independently runnable services split around business capabilities. They can be deployed, scaled, and owned separately, but they introduce distributed system complexity like network failures, data consistency, observability, and deployment coordination.

## Question: Are Microservices Better Than Monoliths?

Strong answer:

> Not always. Microservices solve problems around independent deployment, scaling, ownership, and failure isolation, but they add complexity. For many early systems, a modular monolith is better because it keeps boundaries clean without distributed systems overhead.

## Question: When Would You Choose A Modular Monolith?

Strong answer:

> I would choose a modular monolith when the team wants clear domain boundaries but does not yet need independent deployment or scaling. It is a strong default when product boundaries are still evolving and operational simplicity matters.

## Question: When Would You Choose Microservices?

Strong answer:

> I would choose microservices when domains are clear and different parts of the system need independent deployment, scaling, ownership, or failure isolation. I would also make sure the team has enough CI/CD, observability, and operational maturity to handle the complexity.

## Question: Can Microservices Live In A Monorepo?

Strong answer:

> Yes. Microservices describe runtime boundaries, while monorepo describes source organization. A monorepo can contain many independently runnable services, as long as service boundaries and deployment practices are respected.

## Question: How Would You Migrate From Monolith To Microservices?

Strong answer:

> I would first modularize the monolith, add tests around module behavior, identify a capability with a strong reason for independence, define a stable API or event contract, extract it gradually using a gateway or strangler pattern, monitor it, and remove old code after the new service is stable.

## Question: Where Does Artistry Cart Fit?

Strong answer:

> Artistry Cart is an Nx monorepo with multiple frontend apps, backend services, e2e projects, and shared packages. Runtime responsibilities are split into services such as auth, product, order, recommendations, AI Vision, gateway, and Kafka analytics. Because several services share Prisma/MongoDB, I would describe it as a service-oriented monorepo rather than fully autonomous microservices.

## Best Short Project Pitch For This Topic

> Artistry Cart separates source organization from runtime architecture. It uses a monorepo for shared tooling and atomic changes, while splitting backend responsibilities into services for domain clarity and future independent scaling. The honest tradeoff is that shared persistence keeps the system practical but makes it less than textbook microservices.

