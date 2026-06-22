# Kubernetes In Artistry Cart

## Kubernetes Folder Map

```text
k8s/
  README.md
  base/
  overlays/
    dev/
    staging/
    production/
  addons/
    monitoring/
```

## Base Resources

`k8s/base/kustomization.yaml` includes:

- namespace
- configmap
- ingress
- network policies
- user-ui Deployment/Service/PDB/HPA
- seller-ui Deployment/Service/PDB/HPA
- api-gateway Deployment/Service/PDB/HPA
- auth-service Deployment/Service/HPA
- product-service Deployment/Service
- order-service Deployment/Service/HPA
- recommendation-service Deployment/Service/HPA
- aivision-service Deployment/Service/HPA
- kafka-service Deployment
- product-cleanup CronJob

## Public Exposure

The Kubernetes README states:

```text
only user-ui, seller-ui, and api-gateway are exposed publicly
```

This means:

- browser traffic reaches frontends/gateway
- backend domain services stay internal
- internal services use ClusterIP style access

## Worker And Cron

`kafka-service`:

```text
worker deployment for continuous event consumption
```

`product-cleanup-cronjob`:

```text
scheduled cleanup job
```

The README notes product-service disables in-process cleanup cron in Kubernetes and uses a CronJob instead.

## Config And Secrets

Config:

```text
k8s/base/configmap.yaml
```

Secrets example:

```text
k8s/base/secrets.example.yaml
```

Before applying, create a real:

```text
artistry-cart-secrets
```

Do not commit real production secrets.

## Apply Flow

From the README:

```bash
kubectl apply -k k8s/overlays/dev
```

Optional monitoring:

```bash
kubectl apply -k k8s/addons/monitoring/overlays/dev
```

## Image Strategy

Deployments reference images such as:

```text
ghcr.io/your-org/artistry-cart-api-gateway:master
```

In a real pipeline, CI should:

- build images
- tag images immutably
- push to registry
- update manifests or overlay image tags
- deploy to environment

## Debugging Commands

Useful commands:

```bash
kubectl get pods -n artistry-cart
kubectl get svc -n artistry-cart
kubectl describe deployment api-gateway -n artistry-cart
kubectl logs deployment/api-gateway -n artistry-cart
kubectl rollout status deployment/api-gateway -n artistry-cart
kubectl get hpa -n artistry-cart
kubectl get events -n artistry-cart --sort-by=.lastTimestamp
```

## Interview Explanation

If asked "How is Kubernetes used in Artistry Cart?", say:

> Artistry Cart has a Kubernetes baseline with base manifests and dev/staging/production Kustomize overlays. It deploys the frontends, API gateway, backend services, Kafka worker, and a product cleanup CronJob. Only user-ui, seller-ui, and api-gateway are exposed publicly; internal services stay behind ClusterIP services. Config is split into ConfigMaps and Secrets, and services use probes, resources, HPAs, PDBs, network policies, and optional monitoring resources.

