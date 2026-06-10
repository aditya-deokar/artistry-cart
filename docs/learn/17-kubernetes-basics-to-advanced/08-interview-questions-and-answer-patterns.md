# Interview Questions And Answer Patterns

This file gives interview-ready answers for Kubernetes.

## Question: What Is Kubernetes?

Strong answer:

> Kubernetes is a container orchestration platform. It lets us declare how containerized applications should run, then manages scheduling, scaling, networking, health checks, rolling updates, configuration, and self-healing so actual state matches desired state.

## Question: What Is A Pod?

Strong answer:

> A Pod is the smallest deployable unit in Kubernetes. It usually runs one application container and is ephemeral, meaning Kubernetes can recreate or replace it.

## Question: Pod Versus Deployment?

Strong answer:

> A Pod runs containers. A Deployment manages replicated Pods, rolling updates, and desired state. We usually deploy applications through Deployments rather than managing Pods directly.

## Question: What Is A Service?

Strong answer:

> A Service gives stable networking to a set of Pods. Pods can be recreated with new IPs, but the Service provides a stable DNS name and load balances traffic to ready Pods.

## Question: ClusterIP Versus Ingress?

Strong answer:

> ClusterIP exposes a service only inside the cluster. Ingress exposes HTTP routes from outside the cluster to internal services, usually through an ingress controller. Internal backend services often use ClusterIP, while public frontend/gateway traffic goes through Ingress.

## Question: ConfigMap Versus Secret?

Strong answer:

> ConfigMaps store non-sensitive configuration, while Secrets store sensitive values like database credentials, JWT secrets, Stripe keys, and OAuth secrets. Secrets still need proper RBAC, encryption, and rotation in production.

## Question: Liveness Versus Readiness?

Strong answer:

> Liveness checks whether a container should be restarted. Readiness checks whether a Pod should receive traffic. A Pod can be alive but not ready while warming up or waiting for dependencies.

## Question: What Are Requests And Limits?

Strong answer:

> Requests tell Kubernetes the resources a container needs for scheduling. Limits cap how much CPU or memory it can use. Requests help placement and autoscaling; limits protect nodes but can cause throttling or OOM kills if set poorly.

## Question: What Is HPA?

Strong answer:

> HPA means Horizontal Pod Autoscaler. It automatically adjusts replica count based on metrics such as CPU or memory, assuming metrics are available and resource requests are set.

## Question: What Is A PDB?

Strong answer:

> A PodDisruptionBudget defines how many Pods must remain available during voluntary disruptions, such as node drains. It helps maintain availability during planned maintenance.

## Question: What Is NetworkPolicy?

Strong answer:

> NetworkPolicy restricts network traffic between Pods. It helps enforce least privilege so only allowed services can communicate. It requires a network plugin that supports policy enforcement.

## Question: What Is Kustomize?

Strong answer:

> Kustomize manages Kubernetes YAML using a base and overlays. The base contains shared manifests, while overlays patch environment-specific settings such as replicas, resources, hostnames, image tags, or HPA values.

## Question: How Do You Debug Kubernetes Deployments?

Strong answer:

> I check Pods, Deployments, Services, events, logs, probes, image pull status, environment variables, resource limits, and rollout status. Commands like `kubectl get pods`, `kubectl describe pod`, `kubectl logs`, and `kubectl rollout status` are the first tools I use.

## Question: How Does This Apply To Artistry Cart?

Strong answer:

> Artistry Cart uses Kustomize with base manifests and dev/staging/production overlays. It deploys frontends, gateway, backend services, a Kafka worker, and a product cleanup CronJob. Only user-ui, seller-ui, and api-gateway are public; internal services stay behind ClusterIP services. The manifests include ConfigMaps, Secrets, probes, resources, HPAs, PDBs, NetworkPolicies, and optional monitoring.

## Best Short Project Pitch For This Topic

> Kubernetes in Artistry Cart turns the Dockerized service architecture into deployable infrastructure. The manifests define how each frontend, backend service, worker, and scheduled job runs, how traffic enters through Ingress, how internal services communicate, how config/secrets are injected, and how health, scaling, disruption, and monitoring are handled.

