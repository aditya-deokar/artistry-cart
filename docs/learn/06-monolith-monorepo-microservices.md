# Monolith, Monorepo, And Microservices

## The Short Version

These terms describe different dimensions.

| Term | What it describes |
| --- | --- |
| Monolith | Runtime and deployment architecture |
| Monorepo | Source-code repository strategy |
| Microservices | Runtime and service-boundary architecture |

A monorepo can contain a monolith or microservices.

A microservices system can live in one repo or many repos.

## Monolith

A monolith is an application deployed as one unit.

Typical shape:

```text
UI/API/controllers/services/repositories -> one deployable application -> database
```

### Benefits

- simple local development
- simple deployment
- easy transactions
- easy debugging at small scale
- fewer network failures
- faster early product iteration

### Costs

- can become hard to understand
- one bad area can affect the whole app
- scaling is coarse-grained
- deployments are all-or-nothing
- teams can block each other as code grows

### Best Fit

Use a monolith when:

- the product is young
- domain boundaries are unclear
- team size is small
- operational simplicity matters more than independent scaling

## Modular Monolith

A modular monolith is one deployable application with strong internal module boundaries.

It is often the best default architecture.

It gives:

- simple deployment
- clear domain modules
- fewer distributed system problems
- easier future extraction into services

If modules are enforced well, a modular monolith can outperform premature microservices.

## Monorepo

A monorepo is one repository containing multiple projects.

Typical shape:

```text
repo/
  apps/
  packages/
  docs/
  tools/
```

### Benefits

- one source of truth
- atomic cross-project changes
- shared tooling
- easy code discovery
- consistent dependencies
- simpler large refactors
- unified docs and architecture decisions

### Costs

- can become large and cognitively heavy
- CI can become slow without affected builds
- shared packages can create hidden coupling
- permissions and ownership can be harder
- dependency upgrades can affect many projects

### Best Fit

Use a monorepo when:

- projects change together often
- shared contracts are important
- teams need consistent tooling
- cross-application refactors are common
- you have tooling like Nx to manage scale

## Microservices

Microservices are independently runnable services split around capabilities.

Typical shape:

```text
client -> gateway -> service A
                  -> service B
                  -> service C

service A -> database A
service B -> database B
service C -> database C
```

In practice, many real systems start with shared infrastructure and move toward stronger independence over time.

### Benefits

- independent deployment
- targeted scaling
- clearer ownership
- failure isolation
- technology flexibility
- domain-specific runtime choices

### Costs

- network complexity
- data consistency problems
- more DevOps overhead
- harder local development
- distributed tracing and logging needs
- API versioning and contract management
- more difficult testing

### Best Fit

Use microservices when:

- domain boundaries are well understood
- teams need independent ownership
- services scale differently
- failure isolation matters
- deployment independence is worth operational complexity

## Comparison Table

| Dimension | Monolith | Modular Monolith | Monorepo | Microservices |
| --- | --- | --- | --- | --- |
| Main concern | deployment shape | internal boundaries | source organization | runtime boundaries |
| Deployable units | one | one | any number | many |
| Repo count | any | any | one | one or many |
| Runtime complexity | low | low-medium | unrelated | high |
| Refactoring ease | high inside app | high inside modules | high across projects | lower across services |
| Team independence | low-medium | medium | depends on ownership | high if boundaries are strong |
| Data consistency | easier | easier | unrelated | harder |
| CI needs | simple | simple-medium | graph-aware CI | service-aware CI/CD |

## Where Artistry Cart Fits

Artistry Cart is:

- a monorepo at the source level
- service-oriented at the backend runtime level
- not a single backend monolith
- not fully autonomous microservices because persistence is shared
- closer to a pragmatic microservices base project inside an Nx monorepo

The best description:

> Artistry Cart uses an Nx monorepo to manage multiple deployable applications and services. The backend is split into service boundaries around auth, product, order, recommendations, AI Vision, gateway, and analytics ingestion, while shared packages and a shared Prisma/MongoDB layer keep development practical.

## Interview Trap To Avoid

Do not say:

> Monorepo means monolith.

Better:

> Monorepo and monolith are separate dimensions. A monorepo is about code organization; a monolith is about deployment and runtime structure. This project uses one repo but multiple runnable services.

