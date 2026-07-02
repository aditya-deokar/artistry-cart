# Artistry Cart — Local Development Guide (Docker)

This guide explains how to spin up the entire Artistry Cart ecosystem locally using Docker Compose. By following these steps, you will run all microservices, databases, and message brokers in isolated containers.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your machine:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Make sure it is running)
- [Node.js](https://nodejs.org/) (v20 or higher recommended)
- [PNPM](https://pnpm.io/) (`npm install -g pnpm`)

## 🛠️ Step 1: Environment Setup

All services rely on environment variables. You need to create a `.env` file at the root of the monorepo.

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in any required missing secrets (e.g., OAuth client IDs, Stripe keys, AI API keys). 
   *Note: For local testing, most default values are already sufficient to start the containers.*

## 🐳 Step 2: Running the Project

The monorepo contains several Docker Compose files located in `docker/compose/`. You can choose to run just the infrastructure, or the entire stack.

### Option A: Run Everything (Infrastructure + All Services)
This is the easiest way to start the complete platform. It uses `docker-compose.full.yml` which combines databases, Kafka, all backend microservices, and the frontend UIs.

```bash
docker compose -f docker/compose/docker-compose.full.yml up --build -d
```
*Note: The `--build` flag ensures your local code changes are built into the Docker images.*

### Option B: Run Only Infrastructure (Databases & Brokers)
If you want to run the Node.js services locally via `pnpm run dev` but need the databases and Kafka running in Docker:

```bash
docker compose -f docker/compose/docker-compose.infra.yml up -d
```
*(You can also use the NPM shortcut: `pnpm run infra:up`)*

## 🌐 Accessing the Services

Once the full stack is running, you can access the applications at the following URLs:

### Frontend Applications
- **User UI (Next.js)**: [http://localhost:3000](http://localhost:3000)
- **Seller UI (Next.js)**: [http://localhost:3001](http://localhost:3001)

### API & Gateway
- **API Gateway**: [http://localhost:8080](http://localhost:8080)
- **Swagger Documentation**: [http://localhost:8080/docs](http://localhost:8080/docs) (if enabled on gateway)

### Infrastructure Dashboards
- **Kafka / Redpanda Console**: [http://localhost:8089](http://localhost:8089)
  *Use this to view Kafka topics, consumer lag, and messages in real-time.*

## 🛑 Stopping and Cleaning Up

To stop all running containers without losing your database data:
```bash
docker compose -f docker/compose/docker-compose.full.yml down
```

To stop containers and **wipe all data** (useful for a completely fresh start):
```bash
docker compose -f docker/compose/docker-compose.full.yml down -v
```

## 🐛 Troubleshooting

1. **Port Conflicts**: If a container fails to start with a "port already allocated" error, ensure you don't have local instances of MongoDB (27017), Redis (6379), or another app running on the required ports.
2. **Missing Network**: If Docker complains about the `artistry-cart-edge` or `artistry-cart-data` networks, they will be created automatically by compose, but you can manually create them if needed: `docker network create artistry-cart-data`.
3. **Kafka Not Ready**: Microservices will wait for the `kafka-init` container to finish creating topics before they start. If services are stuck in a "starting" state, check the Kafka logs: `docker logs kafka-init`.
4. **Stale Images**: If your recent code changes aren't reflecting in the Docker containers, remember to append `--build` to your `docker compose up` command.
