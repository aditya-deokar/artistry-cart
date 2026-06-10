# Architecture Dimensions

## Why The Terms Get Confused

People often compare:

```text
monolith vs monorepo
monorepo vs microservices
microservices vs modular monolith
```

But these are not all the same type of thing.

Some terms describe source code organization. Others describe runtime architecture or internal boundaries.

## Four Different Questions

### Repository Question

Where does the source code live?

Answers:

- one repo
- many repos

This is where monorepo belongs.

### Runtime Question

How many applications or services run?

Answers:

- one deployable application
- many deployable services

This is where monolith and microservices belong.

### Boundary Question

How cleanly is the code separated internally?

Answers:

- weak internal boundaries
- strong module boundaries
- service boundaries

This is where modular monolith belongs.

### Ownership Question

Who owns what, and how independently can they change it?

Answers:

- one team owns all
- teams own modules
- teams own services
- teams own separate repos/services

## The Matrix

You can combine these ideas.

| Source organization | Runtime architecture | Example |
| --- | --- | --- |
| One repo | One monolith | simple full-stack app in one repo |
| One repo | Modular monolith | one backend app with strong domain modules |
| One repo | Microservices | many services in an Nx monorepo |
| Many repos | One monolith | frontend repo and backend monolith repo |
| Many repos | Microservices | one repo per service |

## Key Interview Trap

Do not say:

> Monorepo means monolith.

Better:

> Monorepo describes source control. Monolith describes runtime/deployment. A monorepo can contain one monolith or many microservices.

## Why This Matters

If you mix the terms, your architecture explanation becomes unclear.

Correct:

```text
We use a monorepo for source organization and multiple services for runtime separation.
```

Incorrect:

```text
We use a monorepo, so it is microservices.
```

The repo structure does not prove service independence.

## Artistry Cart In These Dimensions

Source organization:

```text
one Nx monorepo
```

Runtime architecture:

```text
multiple frontend apps and backend services
```

Internal boundaries:

```text
apps and packages with service/domain responsibilities
```

Data ownership:

```text
shared Prisma/MongoDB layer, so autonomy is partial
```

Best honest description:

> Artistry Cart is a service-oriented monorepo. It has multiple runnable services, but shared persistence means it is not fully autonomous textbook microservices.

