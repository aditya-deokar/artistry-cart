# Requirements, Scope, Assumptions, And Constraints

## Why Clarification Matters

Most system design prompts are intentionally vague.

Example:

```text
Design an ecommerce platform.
```

This could mean:

- tiny shop
- Amazon-scale marketplace
- B2B ordering system
- digital products
- artisan marketplace
- auction platform
- seller SaaS dashboard

If you design before clarifying, you may solve the wrong problem.

## Clarifying Questions

Ask questions like:

- Who are the users?
- What are the main workflows?
- Is this read-heavy or write-heavy?
- Is payment involved?
- Do we need search?
- Do sellers manage inventory?
- Do we need recommendations?
- What consistency is required?
- What traffic scale should we assume?
- What availability is expected?
- What should be in scope for the interview?

Ask enough to focus the design, not so many that the conversation stalls.

## Functional Requirements

For an ecommerce design, functional requirements might be:

- buyer signup and login
- seller onboarding
- product listing and search
- product detail page
- cart and checkout
- payment webhook handling
- order history
- seller order management
- recommendations
- analytics events

Pick the top 3 to 5 core flows for the interview.

## Non-Functional Requirements

Common non-functional requirements:

- availability
- latency
- consistency
- durability
- security
- privacy
- scalability
- observability
- maintainability
- cost

Example:

```text
Product browsing should be low latency and highly available.
Payment state should prioritize correctness and durability.
Recommendation updates can be eventually consistent.
```

## Scope Control

You cannot design everything deeply in 45 minutes.

Say what you will focus on:

```text
I will focus on product browse, checkout, payments, and analytics/recommendations. I will mention seller tooling and AI as extensions if we have time.
```

This shows control.

## Assumptions

Assumptions fill missing information.

Good assumptions are explicit:

```text
I will assume 1 million monthly active users, mostly read-heavy product browsing, and payment correctness as the strictest consistency area.
```

If the interviewer changes an assumption, adapt.

## Constraints

Constraints shape the design.

Examples:

- small team
- fast product iteration
- strict payment correctness
- limited budget
- existing MongoDB stack
- need for AI integrations
- strong observability requirement
- regional deployment only

Constraints are not annoyances. They are design inputs.

## Requirement Prioritization

Not all requirements are equal.

For Artistry Cart-like ecommerce:

- payment correctness is critical
- product browsing should be fast
- analytics can be eventually consistent
- recommendations can be stale briefly
- AI generation can be slower if progress is visible

## Strong Interview Answer

If asked "What requirements would you clarify first?", say:

> I would clarify the user personas, core workflows, read/write traffic shape, scale assumptions, consistency requirements, external dependencies like payments, and the non-functional goals around latency, availability, security, and observability. Then I would scope the design around the highest-value flows instead of trying to design every feature at once.

## Artistry Cart Connection

For Artistry Cart, the key personas are buyers and sellers. The core flows are browse/search, auth, checkout/payment, seller catalog management, recommendations, analytics capture, and AI-assisted discovery. Payment needs stronger correctness than analytics or recommendations.
