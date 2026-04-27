# Business Context

## Product Framing

Artistry Cart appears to be positioned as a curated artisan-commerce platform rather than a generic marketplace. The codebase suggests a product focused on discovery, storytelling, seller identity, and richer merchandising experiences.

Signals in the repository that support that interpretation include:

- dedicated buyer and seller frontends
- shop and artisan-oriented user journeys
- event, discount, and offer tooling
- AI Vision flows for concept generation and visual search
- brand and experience documentation already present under `docs/brand`

## Primary Actors

The platform serves at least four important actors:

1. Buyers
   - browse, search, discover, and purchase products
   - explore artisans and shops
   - interact with cart, wishlist, profile, and AI-assisted discovery flows

2. Sellers
   - register, verify, and create shops
   - manage catalog, pricing, offers, events, and orders
   - use dashboard tooling to operate their storefront

3. Platform operators
   - define categories and site configuration
   - maintain service configuration and runtime integrations
   - monitor CI, test flows, and production-readiness concerns

4. AI-assisted collaboration users
   - use concept generation or visual search to explore design ideas
   - potentially connect generated concepts with artisans or galleries

## Business Capabilities Reflected In Code

The repository already encodes several platform capabilities:

- authentication and OAuth
- product and shop management
- order and payment orchestration
- recommendation features driven by captured user activity
- AI-assisted inspiration and search
- seller growth tooling through discounts, offers, and events

This matters for documentation because the project should be presented as a platform with multiple bounded capabilities, not as a single-service ecommerce demo.

## Why This Matters For Documentation

Strong technical documentation should preserve the product context because architecture choices only make sense when connected back to business intent.

Examples:

- a separate seller UI exists because seller workflows differ from buyer workflows
- an API gateway exists because multiple backend services must be exposed behind a simpler client boundary
- Kafka exists because some behavioral processing is better handled asynchronously
- AI Vision exists as a separate service because AI workflows have different runtime characteristics than core commerce APIs

## Interview Value

For interviews, this business context helps you explain:

- why the platform has multiple frontends
- why the system evolved into multiple services
- why there is both synchronous request handling and asynchronous event processing
- why AI capabilities are attached to the commerce platform instead of being a side demo

## Related Docs

- [Product Overview](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/00-overview/product-overview.md>)
- [Repository Map](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/00-overview/repo-map.md>)
- [Glossary](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/00-overview/glossary.md>)
