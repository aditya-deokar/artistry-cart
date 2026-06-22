# Kubernetes Basics To Advanced

This folder is the seventeenth learning block for preparing for a bigger engineering role. It explains Kubernetes from first principles, then connects those ideas to the Artistry Cart Kubernetes baseline.

The goal is to understand how containerized services are deployed, exposed, configured, scaled, secured, monitored, and debugged in Kubernetes.

## Learning Outcome

After completing this topic, you should be able to explain:

- what Kubernetes is and why it exists
- cluster, node, pod, container, deployment, replica set, and service
- ClusterIP, NodePort, LoadBalancer, and Ingress
- ConfigMaps and Secrets
- liveness and readiness probes
- resource requests and limits
- HPA autoscaling
- PodDisruptionBudget
- NetworkPolicy
- CronJob
- Kustomize bases and overlays
- monitoring with PodMonitor and PrometheusRule
- Kubernetes debugging commands
- how Artistry Cart maps services into Kubernetes manifests

## Files In This Topic

1. [Kubernetes Fundamentals](./01-kubernetes-fundamentals.md)
2. [Pods, Deployments, ReplicaSets, And Services](./02-pods-deployments-replicasets-services.md)
3. [Ingress, ConfigMaps, Secrets, And Environment Config](./03-ingress-configmaps-secrets-env.md)
4. [Health Checks, Resources, HPA, And PDB](./04-healthchecks-resources-hpa-pdb.md)
5. [Network Policies, CronJobs, And Security Contexts](./05-network-policies-cronjobs-security-contexts.md)
6. [Kustomize Bases, Overlays, And Environment Promotion](./06-kustomize-bases-overlays-environment-promotion.md)
7. [Kubernetes In Artistry Cart](./07-kubernetes-in-artistry-cart.md)
8. [Interview Questions And Answer Patterns](./08-interview-questions-and-answer-patterns.md)

## Core Mental Model

```text
container image -> Pod -> Deployment manages replicas -> Service gives stable networking -> Ingress exposes public routes
```

Configuration:

```text
ConfigMap = non-secret config
Secret = sensitive config
```

Operations:

```text
readiness = should receive traffic?
liveness = should be restarted?
HPA = scale replicas based on metrics
PDB = keep enough pods available during disruption
```

## Connection To Artistry Cart

Artistry Cart has Kubernetes manifests under:

```text
k8s/
  base/
  overlays/dev
  overlays/staging
  overlays/production
  addons/monitoring
```

The baseline deploys frontends, gateway, backend services, a Kafka worker deployment, a product cleanup CronJob, ConfigMaps/Secrets, Ingress, HPAs, PDBs, NetworkPolicies, and optional monitoring resources.

