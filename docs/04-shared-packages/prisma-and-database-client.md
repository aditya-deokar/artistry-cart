# Prisma And Database Client

## Overview

`packages/libs/prisma` is the shared Prisma client entry point for the monorepo. It is the main bridge between backend services and MongoDB.

## What It Does

- creates a `PrismaClient`
- caches the client on `globalThis` outside production
- exports a default shared client instance

## Why It Exists

This package avoids:

- duplicate Prisma client setup in every service
- inconsistent database access initialization
- unnecessary repeated client creation during local development

## Architectural Role

This is one of the most important shared packages because it reveals a core architectural truth:

- the services are separated at the application boundary
- they are not separated at the persistence-client boundary

Multiple services use the same Prisma client package against the same MongoDB schema.

## Benefits

- very fast to build and iterate
- consistent typed access to the schema
- lower duplication
- simpler onboarding

## Tradeoffs

- weaker service autonomy
- shared schema changes affect many services at once
- true database-per-service evolution becomes harder

## Related Runtime Behavior

Prisma errors are normalized by the shared error middleware in several services. That means the database client and error-handling layers work as a pair.

## Interview Notes

This package is a clean example of a pragmatic choice that optimizes developer velocity over strict distributed-systems purity.
