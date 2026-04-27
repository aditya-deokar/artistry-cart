# Port Map

## Default Local Ports

This map documents the ports referenced by the current codebase and local infrastructure.

| Port | Component | Notes |
| --- | --- | --- |
| `3000` | `user-ui` | Buyer-facing Next.js app |
| `3001` | `seller-ui` | Seller-facing Next.js app; referenced by backend CORS rules |
| `6001` | `auth-service` | Auth, registration, OAuth |
| `6002` | `product-service` | Products, shops, search, discounts, events, offers |
| `6004` | `order-service` | Orders, payments, webhooks |
| `6005` | `recommendation-service` | Recommendation API |
| `6006` | `aivision-service` | AI Vision API |
| `8080` | `api-gateway` | Client-facing backend entry point |
| `8089` | Kafka UI | Local browser-based Kafka inspection UI |
| `9092` | Kafka | Broker endpoint |
| `9093` | Kafka controller | Internal controller listener in local Compose |
| `2181` | Zookeeper | Local Kafka dependency in Compose |
| `6379` | Redis | Default local Redis port |
| `27017` | MongoDB | Default local MongoDB port |

## Gateway Proxy Map

The API gateway currently proxies:

| Gateway prefix | Upstream |
| --- | --- |
| `/auth` | `http://localhost:6001` |
| `/product` | `http://localhost:6002` |
| `/order` | `http://localhost:6004` |
| `/recommendation` | `http://localhost:6005` |
| `/ai-vision` | `http://localhost:6006` |

## Frontend Expectations

The frontends assume:

- buyer app origin: `http://localhost:3000`
- seller app origin: `http://localhost:3001`
- backend entry point: `http://localhost:8080` unless overridden

## Why This File Exists

Port mismatches are one of the easiest ways to lose time in a multi-service repository. This file exists so setup docs, service docs, and troubleshooting docs can all point to one source.
