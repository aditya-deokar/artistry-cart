# Kubernetes Fundamentals

## What Kubernetes Is

Kubernetes is a platform for running containerized applications.

It helps with:

- deployment
- scaling
- service discovery
- self-healing
- configuration
- rolling updates
- resource management
- networking
- operational control

Kubernetes is often shortened to K8s.

## Why Kubernetes Exists

Docker can run containers, but production systems need more:

- keep containers running
- restart failed containers
- run multiple replicas
- route traffic to healthy replicas
- scale services
- update images safely
- manage secrets/config
- isolate internal services
- schedule workloads across machines

Kubernetes handles these orchestration problems.

## Cluster

A cluster is the full Kubernetes environment.

It contains:

- control plane
- worker nodes
- networking
- storage integrations
- workloads

## Node

A node is a machine where workloads run.

It may be:

- physical server
- cloud VM
- local dev node

Pods are scheduled onto nodes.

## Control Plane

The control plane manages the cluster.

It decides:

- what should run
- where workloads should be scheduled
- whether desired state matches actual state
- how to respond to failures

## Desired State

Kubernetes is declarative.

You declare desired state:

```text
run 2 replicas of api-gateway image
expose it on port 8080
restart unhealthy pods
```

Kubernetes works to make actual state match desired state.

## Manifest

A manifest is YAML describing Kubernetes resources.

Example resource types:

- Deployment
- Service
- ConfigMap
- Secret
- Ingress
- HPA
- CronJob
- NetworkPolicy

## Namespace

A namespace groups resources.

Example:

```text
artistry-cart
```

Namespaces help separate environments, teams, or applications.

## kubectl

`kubectl` is the command-line tool for Kubernetes.

Common commands:

```bash
kubectl get pods
kubectl get deployments
kubectl describe pod <pod-name>
kubectl logs <pod-name>
kubectl apply -f manifest.yaml
kubectl apply -k k8s/overlays/dev
```

## Interview Explanation

If asked "What is Kubernetes?", say:

> Kubernetes is a container orchestration platform. It lets us declare how containerized applications should run, then manages scheduling, scaling, networking, health checks, rolling updates, configuration, and self-healing so the actual cluster state matches the desired state.

## Connection To Artistry Cart

Artistry Cart uses Kubernetes manifests to describe how its frontends, gateway, backend services, worker, cleanup job, config, network policy, scaling, and monitoring should run across environments.

