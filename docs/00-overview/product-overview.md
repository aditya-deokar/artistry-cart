# Product Overview

## Summary

Artistry Cart is a multi-application ecommerce platform built around artisan commerce. It combines a shopper-facing marketplace, a seller-facing operations dashboard, and a service-oriented backend with AI-assisted discovery features.

The platform is more than a storefront. It also includes:

- seller onboarding and shop creation
- product catalog and search
- discount, event, and offer management
- checkout and payment workflows
- recommendation and analytics processing
- AI Vision flows for concept generation, visual search, and artisan collaboration

## What The Platform Does

At a user level, the system supports three major experiences:

1. Buyer experience
   - browse products, shops, artisans, and events
   - search the catalog
   - manage cart, wishlist, profile, and orders
   - interact with AI-assisted inspiration and discovery features

2. Seller experience
   - register as a seller
   - create a shop
   - manage products, discounts, offers, and events
   - review orders and operational data

3. Platform and intelligence experience
   - authenticate users and sellers
   - route traffic through a gateway
   - process payments and order lifecycle changes
   - collect behavioral signals for analytics and recommendations
   - run AI Vision flows in a dedicated service boundary

## Why The Project Is Interesting

This repository is stronger than a basic CRUD commerce app because it combines:

- multiple user surfaces
- microservice-style service separation
- shared runtime packages
- asynchronous analytics ingestion through Kafka
- Stripe integration
- MongoDB + Prisma data modeling
- AI-heavy workflows separated into their own service

That makes it a useful project for senior-level discussion around boundaries, scaling paths, operational complexity, and tradeoffs.

## High-Level System Shape

The current codebase is organized as:

- `user-ui`: shopper-facing Next.js app
- `seller-ui`: seller/admin-style Next.js app
- `api-gateway`: entry point for client traffic to backend services
- `auth-service`: identity and registration flows
- `product-service`: product, search, shop, event, offer, and discount flows
- `order-service`: checkout, payment, webhook, and order flows
- `recommendation-service`: recommendation APIs and recommendation logic
- `kafka-service`: analytics event consumer
- `aivision-service`: AI generation and visual search workflows

## Current State Of Documentation

The codebase already includes useful docs, especially around AI Vision and brand work, but they were written as focused initiatives rather than a coherent platform handbook.

The new documentation initiative reorganizes that knowledge into:

- stable onboarding docs
- architecture docs
- service deep dives
- domain docs
- decision and tradeoff docs
- interview-prep docs

## Recommended Reading Path

Continue with:

1. [Business Context](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/00-overview/business-context.md>)
2. [Repository Map](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/00-overview/repo-map.md>)
3. [Local Development](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/docs/01-getting-started/local-development.md>)
