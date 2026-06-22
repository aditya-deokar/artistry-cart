# Pods, Deployments, ReplicaSets, And Services

## Pod

A Pod is the smallest deployable unit in Kubernetes.

A Pod usually contains one application container.

Example:

```text
api-gateway pod
  -> api-gateway container
```

Pods are ephemeral. They can be recreated, moved, or replaced.

## Container

A container runs an image.

Example image:

```text
ghcr.io/your-org/artistry-cart-api-gateway:master
```

Kubernetes starts this image inside a Pod.

## Deployment

A Deployment manages a set of replicated Pods.

It defines:

- image
- replicas
- env vars
- ports
- probes
- resources
- rollout behavior

Example:

```text
api-gateway Deployment -> 2 api-gateway Pods
```

## ReplicaSet

A ReplicaSet ensures the desired number of Pods exist.

Usually you do not manage ReplicaSets directly. Deployments create and manage them.

## Rolling Update

A Deployment can update Pods gradually.

Flow:

```text
new image deployed
new pods start
readiness passes
old pods terminate
```

This reduces downtime.

## Service

A Service gives stable networking for Pods.

Pods change IPs. Services provide a stable DNS name and virtual IP.

Example:

```text
api-gateway service -> routes to ready api-gateway pods
```

## ClusterIP

ClusterIP exposes a service inside the cluster only.

Good for internal services:

- auth-service
- product-service
- order-service
- recommendation-service
- aivision-service

## NodePort

NodePort exposes a service on a port on every node.

Less common for production app exposure behind ingress/load balancers.

## LoadBalancer

LoadBalancer asks the cloud provider for an external load balancer.

Useful for public exposure in cloud environments.

## Ingress

Ingress manages HTTP routing into services.

Example:

```text
app domain -> user-ui
api domain/path -> api-gateway
```

## Interview Explanation

If asked "What is the difference between Pod, Deployment, and Service?", say:

> A Pod runs one or more containers. A Deployment manages replicated Pods and rolling updates. A Service gives stable networking to those Pods because Pod IPs are temporary. The Deployment handles lifecycle; the Service handles discovery and routing.

## Connection To Artistry Cart

Artistry Cart has Deployments and Services for:

- `user-ui`
- `seller-ui`
- `api-gateway`
- `auth-service`
- `product-service`
- `order-service`
- `recommendation-service`
- `aivision-service`

`kafka-service` runs as a worker Deployment and does not need the same public HTTP exposure pattern.

