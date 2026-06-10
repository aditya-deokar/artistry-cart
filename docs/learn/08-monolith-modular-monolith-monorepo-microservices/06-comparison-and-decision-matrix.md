# Comparison And Decision Matrix

## Fast Comparison

| Architecture | Main Idea | Best For | Main Risk |
| --- | --- | --- | --- |
| Monolith | one deployable app | early/simple systems | grows tangled |
| Modular monolith | one deployable with strong modules | clean boundaries with simple ops | boundaries can erode |
| Monorepo | one repo for many projects | shared tooling and atomic changes | hidden coupling/slow CI |
| Microservices | many independently runnable services | independent scale/ownership/deploys | distributed complexity |

## Decision By Question

### Is The Team Small?

Prefer:

- monolith
- modular monolith
- monorepo if multiple apps/packages exist

Be careful with:

- many microservices too early

### Are Domain Boundaries Unclear?

Prefer:

- modular monolith

Why:

> You can organize code by domain without paying network and deployment complexity yet.

### Do Different Parts Need Independent Scaling?

Consider:

- microservices

Example:

```text
AI Vision needs different resources than auth.
Kafka analytics worker scales differently from checkout APIs.
```

### Do Teams Need Independent Ownership?

Consider:

- service boundaries
- clear package ownership
- maybe multi-repo later

### Are Changes Often Cross-Cutting?

Consider:

- monorepo

Example:

```text
auth contract affects frontend, gateway, middleware, and backend service.
```

### Is Operational Maturity Low?

Prefer:

- monolith
- modular monolith
- small number of services

Avoid:

- too many distributed services before logs, metrics, tracing, CI/CD, and deployment automation are ready

## Tradeoff Table

| Dimension | Monolith | Modular Monolith | Monorepo | Microservices |
| --- | --- | --- | --- | --- |
| Source repo count | any | any | one | one or many |
| Deployable units | one | one | any | many |
| Runtime complexity | low | low | unrelated | high |
| Code boundaries | often weak | strong if enforced | depends | service-level |
| Deployment independence | low | low | unrelated | high |
| Scaling granularity | whole app | whole app | unrelated | per service |
| Local dev complexity | low | low-medium | medium | high |
| CI complexity | low | medium | high without tooling | high |
| Data consistency | easier | easier | unrelated | harder |
| Refactoring | easy inside app | easy inside modules | easy across projects | harder across services |

## Best Default Advice

For many teams:

```text
start with modular monolith
use monorepo if multiple projects need shared tooling
extract services when boundaries and operational needs are real
```

This avoids premature distributed complexity.

## Artistry Cart Decision

Artistry Cart uses:

```text
monorepo for source organization
service boundaries for runtime responsibilities
shared packages for reuse
shared database for practical development
```

This is a pragmatic architecture for a large learning/portfolio system.

## Interview Explanation

If asked "Which architecture would you choose?", say:

> It depends on product maturity, team size, domain clarity, scaling needs, deployment independence, and operational maturity. I would start with the simplest architecture that preserves clear boundaries, often a modular monolith. I would move to microservices when independent deployment, scaling, ownership, or failure isolation becomes worth the added complexity.

