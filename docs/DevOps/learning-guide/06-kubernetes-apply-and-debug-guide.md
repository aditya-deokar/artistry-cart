# Kubernetes Apply And Debug Guide

## Purpose

This is the practical step-by-step guide I would follow as the DevOps engineer working on this repo.

## 1. Pick The Environment

Decide which overlay you are working with:

- `k8s/overlays/dev`
- `k8s/overlays/staging`
- `k8s/overlays/production`

Start with `dev`.

## 2. Create The Real Secret

Copy the example values from:

- [k8s/base/secrets.example.yaml](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/k8s/base/secrets.example.yaml>)

Then replace every placeholder with real values before applying it.

Important:

- the Kubernetes manifests expect a secret named `artistry-cart-secrets`

## 3. Review The Overlay

Before applying, inspect:

- namespace name
- ingress hosts
- config values
- replica counts
- HPA limits

The most important files are:

- [k8s/overlays/dev/kustomization.yaml](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/k8s/overlays/dev/kustomization.yaml>)
- [k8s/overlays/dev/settings-patches.yaml](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/k8s/overlays/dev/settings-patches.yaml>)
- [k8s/overlays/dev/hpa-patches.yaml](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/k8s/overlays/dev/hpa-patches.yaml>)

## 4. Apply The Overlay

Use:

```bash
kubectl apply -k k8s/overlays/dev
```

For staging:

```bash
kubectl apply -k k8s/overlays/staging
```

For production:

```bash
kubectl apply -k k8s/overlays/production
```

## 5. Check The Namespace

```bash
kubectl get ns
kubectl get all -n artistry-cart-dev
```

What you should expect:

- Deployments created
- Pods starting
- Services created
- HPAs created
- CronJob created

## 6. Check Rollout Health

```bash
kubectl rollout status deployment/user-ui -n artistry-cart-dev
kubectl rollout status deployment/api-gateway -n artistry-cart-dev
kubectl rollout status deployment/auth-service -n artistry-cart-dev
```

If a rollout hangs:

```bash
kubectl describe pod <pod-name> -n artistry-cart-dev
kubectl logs <pod-name> -n artistry-cart-dev
```

## 7. Check Ingress And Services

```bash
kubectl get ingress -n artistry-cart-dev
kubectl describe ingress artistry-cart -n artistry-cart-dev
kubectl get svc -n artistry-cart-dev
```

Look for:

- correct host rules
- correct backend service names
- TLS secret name

## 8. Check Probes

For HTTP workloads:

```bash
kubectl describe pod <pod-name> -n artistry-cart-dev
```

Look for probe failures on:

- `/healthz`
- `/readyz`

If frontend probes fail, verify the new route handlers exist in:

- [user-ui health route](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/apps/user-ui/src/app/healthz/route.ts>)
- [seller-ui health route](</C:/Users/adity/Desktop/Artistry Cart/artistry-cart/apps/seller-ui/src/app/healthz/route.ts>)

## 9. Check Autoscaling

```bash
kubectl get hpa -n artistry-cart-dev
kubectl describe hpa api-gateway -n artistry-cart-dev
```

Remember:

- `product-service` does not have an HPA yet on purpose

## 10. Check Product Cleanup

The cleanup flow now depends on:

- `product-service` internal maintenance endpoint
- `product-cleanup` CronJob
- `MAINTENANCE_TOKEN`

Useful commands:

```bash
kubectl get cronjob -n artistry-cart-dev
kubectl describe cronjob product-cleanup -n artistry-cart-dev
kubectl get jobs -n artistry-cart-dev
kubectl logs job/<job-name> -n artistry-cart-dev
```

## 11. Common Failure Modes

If pods crash immediately:

- image reference may be wrong
- secret values may be missing
- runtime env may not match what the app expects

If frontends load but API calls fail:

- ingress host may be wrong
- `NEXT_PUBLIC_*` build-time values may not match the deployed environment
- gateway upstream service names may be wrong

If auth redirects are wrong:

- `OAUTH_REDIRECT_BASE_URL` is wrong
- `FRONTEND_URL` is wrong

If product cleanup fails:

- `MAINTENANCE_TOKEN` is missing
- the CronJob cannot reach `product-service`
- `PRODUCT_CLEANUP_CRON_ENABLED` is not disabled in the deployment

## 12. What I Would Automate Next

Once manual `kubectl apply -k` works, the next DevOps step is:

1. download the `release-image-manifest` artifact from CI
2. replace overlay image tags or digests automatically
3. deploy the overlay from GitHub Actions
4. run smoke checks
5. require approval before production
