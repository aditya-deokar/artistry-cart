# Deep-Dive Questions

## Purpose

These are the questions a strong interviewer or senior reviewer is likely to ask after the top-level walkthrough. Use the answers as direction, not as a script.

## 1. Why split the backend into multiple services instead of building one backend?

Strong answer shape:

The split reflects real domain and runtime differences. Payments, recommendations, analytics materialization, and AI Vision all behave differently enough that the boundaries are useful. I still kept the architecture pragmatic by sharing the database schema instead of forcing full microservice isolation too early.

## 2. Why keep a shared database if you already split the services?

Strong answer shape:

That was a speed-versus-isolation tradeoff. The service boundaries are real in code and runtime responsibilities, but the platform still benefits from one shared schema for faster iteration and lower coordination cost. I would revisit stricter data ownership if scale, team size, or failure isolation requirements grew.

## 3. What is the most interesting architecture decision in the repo?

Strong answer shape:

The Kafka-backed analytics pipeline is a strong answer because it solves a real problem. User behavior becomes reusable recommendation and personalization input without slowing down transactional requests. The dedicated AI Vision boundary is the other strong choice because it isolates the highest-variance runtime in the system.

## 4. Where is the system weakest today?

Strong answer shape:

The weakest area is operational consistency, not the high-level architecture. Some contracts and conventions are uneven across services, observability is not yet uniform, and AI Vision and Kafka paths are not as deeply integrated into the automated quality loop as the core commerce paths.

## 5. How would you scale recommendations?

Strong answer shape:

I would keep the event-driven capture model, but move more scoring and artifact generation offline. That would reduce request-time work and let the serving layer read from more precomputed recommendation state or caches.

## 6. Why MongoDB instead of a relational database?

Strong answer shape:

The platform mixes standard commerce data with flexible product metadata, analytics documents, and AI-related entities. MongoDB fits that evolution pattern well, and Prisma adds the typed structure that keeps the codebase maintainable. The tradeoff is weaker relational guarantees and softer service storage boundaries.

## 7. How do buyers and sellers differ technically?

Strong answer shape:

They have distinct frontend applications because their workflows differ meaningfully. Buyers need discovery, browsing, commerce, and AI-assisted exploration. Sellers need operational tooling like catalog management, offers, events, and order handling. Sharing one backend platform with role-aware access still keeps the system coherent.

## 8. How does AI Vision connect to the platform instead of feeling like a side demo?

Strong answer shape:

It connects to real platform objects and workflows. Concepts can be persisted, explored, and tied back to artisans, products, and marketplace discovery. That makes AI Vision part of the commerce experience rather than a disconnected experiment.

## 9. What would you improve for production hardening?

Strong answer shape:

I would standardize health, logging, tracing, and validation patterns across services, fix known contract mismatches, expand CI and automated tests for AI and analytics paths, and tighten ownership boundaries around the shared database over time.

## 10. What part of this project shows the most senior engineering judgment?

Strong answer shape:

The strongest signal is not maximal complexity. It is knowing where to add architectural weight and where not to. Kafka is used where async processing improves latency. AI Vision is isolated because it deserves a different runtime boundary. At the same time, the system stays pragmatic by keeping shared infrastructure and one schema while the platform is still evolving.

## 11. If you joined a larger team tomorrow, what would you formalize first?

Strong answer shape:

I would formalize service contracts, ownership boundaries, and observability standards first. Those three things reduce coordination cost quickly and make future scaling work much easier.

## 12. How would you defend the project if someone says it is "not real microservices"?

Strong answer shape:

I would agree that it is not pure microservices, and I would say that is intentional. The platform already has useful runtime and domain boundaries, but it still optimizes for developer speed over strict infrastructure purity. That is a reasonable stage-appropriate decision, and the docs make that tradeoff explicit.

## Related Docs

- [Project Story](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/09-interview-prep/project-story.md>)
- [System Design Walkthrough](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/09-interview-prep/system-design-walkthrough.md>)
- [Tradeoff Talking Points](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/09-interview-prep/tradeoff-talking-points.md>)
