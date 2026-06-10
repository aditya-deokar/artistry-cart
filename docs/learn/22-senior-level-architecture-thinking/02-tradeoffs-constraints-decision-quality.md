# Tradeoffs, Constraints, And Decision Quality

## Every Architecture Decision Is A Tradeoff

There is no free architecture decision.

Each choice gives something and costs something.

Examples:

- cache improves latency but creates staleness
- Kafka reduces foreground work but adds eventual consistency
- microservices improve independent ownership but add distributed complexity
- shared database speeds development but weakens isolation
- Kubernetes improves orchestration but adds platform complexity

Senior engineers say both sides.

## Decision Quality

A good decision is not always the decision that looks best years later.

A good decision is one that:

- fits known requirements
- considers realistic constraints
- identifies risks
- keeps migration options open
- is documented
- can be revisited when facts change

Bad decisions often hide assumptions.

## Constraint Types

Product constraints:

- market speed
- changing requirements
- feature breadth

Team constraints:

- team size
- skill set
- ownership model
- on-call maturity

Technical constraints:

- existing data model
- hosting platform
- external providers
- latency targets

Business constraints:

- cost
- compliance
- timeline
- customer promises

## The Tradeoff Sentence

Use this structure:

```text
We chose X because it improves Y. The tradeoff is Z. If A changes, we should revisit it by doing B.
```

Example:

```text
We chose a shared MongoDB/Prisma layer because it keeps development fast and the schema visible. The tradeoff is weaker service data ownership. If team size or scale grows, we should define model ownership and gradually enforce service-level data boundaries.
```

## Reversibility

Some decisions are easy to reverse.

Examples:

- library choice inside one service
- endpoint naming before external adoption
- local folder layout

Some decisions are hard to reverse.

Examples:

- database choice
- event contract
- service boundary
- public API contract
- payment state model

Hard-to-reverse decisions deserve more discussion and documentation.

## Local Optimum Versus Global Optimum

A decision can make one service simpler while making the whole platform worse.

Example:

```text
putting every helper into one shared utils package is locally convenient but globally increases coupling
```

Senior engineers optimize for the system, not only the file they are touching.

## Decision Smells

Smells:

- "because everyone uses it"
- "because microservices are scalable"
- "because it is cleaner" without explaining for whom
- "we can fix it later" without a migration path
- "this is temporary" without an owner or date

## Strong Interview Answer

If asked "How do you make architecture decisions?", say:

> I compare options against product goals, scale, team maturity, reliability needs, cost, and reversibility. I make the tradeoff explicit: what we gain, what we lose, what risks remain, and what signal would cause us to revisit the decision. For important choices, I document the reasoning in an ADR.

## Artistry Cart Connection

The repo's ADRs are good examples: monorepo, MongoDB/Prisma, API gateway, Kafka analytics, and AI Vision each explain context, decision, consequences, alternatives, and follow-up work.
