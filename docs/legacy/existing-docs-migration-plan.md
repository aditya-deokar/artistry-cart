# Existing Docs Migration Plan

## Purpose

This file records the documentation that existed before the numbered `docs/` structure became the canonical system.

Phase 8 changes the role of those older files:

- they are preserved for historical context and implementation detail
- they are no longer the default source of truth for overlapping topics
- they should point readers back to the canonical numbered docs

## Canonical Rule

For current project understanding, prefer the numbered folders under `docs/`:

- `00-overview` through `09-interview-prep` are the canonical documentation system
- `11-reference` contains stable reference material
- `legacy/`, `brand/`, `ai-vision-api/`, and older top-level standalone docs are reference-only unless explicitly stated otherwise

## Legacy Inventory And Canonical Replacements

| Legacy doc or folder | Current role | Canonical replacement |
| --- | --- | --- |
| `docs/AI_VISION_INTEGRATION_PLAN.md` | historical frontend integration plan | `docs/03-applications/aivision-service.md`, `docs/03-applications/user-ui.md`, `docs/05-domain/ai-vision.md` |
| `docs/AI_VISION_PHASE3_SUMMARY.md` | implementation milestone summary | `docs/05-domain/ai-vision.md`, `docs/07-quality-and-operations/known-gaps-and-risks.md` |
| `docs/CAMERA_FEATURE.md` | feature implementation note | `docs/05-domain/ai-vision.md`, `docs/03-applications/user-ui.md` |
| `docs/COLLECTIONS_FEATURE.md` | feature implementation note | `docs/05-domain/ai-vision.md`, `docs/06-data-and-api/database-schema.md` |
| `docs/COMMENTS_FEATURE.md` | feature implementation note | `docs/05-domain/ai-vision.md`, `docs/06-data-and-api/api-inventory.md` |
| `docs/OAUTH_IMPLEMENTATION.md` | implementation and test note | `docs/03-applications/auth-service.md`, `docs/05-domain/auth-and-identity.md`, `docs/06-data-and-api/auth-contracts.md` |
| `docs/ai-vision-api/*` | legacy AI Vision planning and technical review set | `docs/03-applications/aivision-service.md`, `docs/05-domain/ai-vision.md`, `docs/06-data-and-api/*`, `docs/07-quality-and-operations/*` |
| `docs/brand/PLATFORM_OVERVIEW.md` | product-positioning reference | `docs/00-overview/product-overview.md`, `docs/00-overview/business-context.md` |
| `docs/brand/TECHNICAL_ARCHITECTURE.md` | aspirational architecture reference | `docs/02-architecture/*`, `docs/03-applications/*`, `docs/08-decisions/*` |
| `docs/brand/IMPLEMENTATION_PLAN.md` | historical roadmap note | `docs/docs-implemenataion.md` |
| `docs/brand/REVENUE_MODEL.md` | business-context reference | `docs/00-overview/business-context.md` |
| `docs/brand/BRAND_IDENTITY.md` and page blueprints | experience and design reference | no direct canonical replacement; keep as product-design background |
| `apps/auth-service/OAUTH_SETUP.md` | service-local setup supplement | keep local to `auth-service`; cross-link from auth docs if needed |
| `apps/product-service/POSTMAN_GUIDE.md` | service-local API testing note | `docs/03-applications/product-service.md`, `docs/06-data-and-api/api-inventory.md` |
| `apps/product-service/SELLER_PRODUCTS_API.md` | focused API note | `docs/03-applications/product-service.md`, `docs/06-data-and-api/api-inventory.md` |

## Cleanup Actions Completed In Phase 8

- confirmed the numbered docs are the canonical system
- updated legacy entry points to label their status clearly
- added canonical pointers to overlapping standalone docs
- reclassified `brand/` as product and experience reference material
- reclassified `ai-vision-api/` as a historical planning and review archive

## What We Are Not Doing

To avoid losing useful context, this phase does not delete older docs. Some of them still contain:

- detailed milestone history
- implementation review notes
- feature-specific examples
- product and brand rationale that is useful in interviews

The goal is clarity, not cleanup theater.

## Ongoing Maintenance Rules

When future work changes the system:

1. update the canonical numbered docs first
2. only update legacy docs if they remain useful as historical records
3. do not create new top-level standalone markdown files under `docs/` for durable documentation
4. if a temporary planning doc is created, either migrate it into the numbered tree or mark it clearly as temporary

## Completion State

Phase 8 is complete when a reader can land in an older doc and still be redirected quickly to the canonical material. That condition is now satisfied.
