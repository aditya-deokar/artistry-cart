# Ingress, ConfigMaps, Secrets, And Environment Config

## Ingress

Ingress defines HTTP/HTTPS routing from outside the cluster to internal services.

Use cases:

- expose frontend apps
- expose API gateway
- route by host
- route by path
- terminate TLS depending on ingress controller setup

## Public Versus Internal Services

Artistry Cart baseline says:

```text
only user-ui, seller-ui, and api-gateway are exposed publicly
internal services stay behind ClusterIP
```

This is a good security pattern.

Frontends and gateway are edge-facing. Domain services remain internal.

## ConfigMap

A ConfigMap stores non-secret configuration.

Examples:

- service URLs
- public frontend URL
- CORS origins
- feature flags
- Redis enabled flag
- log level

Use:

```yaml
envFrom:
  - configMapRef:
      name: artistry-cart-platform-config
```

## Secret

A Secret stores sensitive config.

Examples:

- database credentials
- JWT secrets
- Stripe secret key
- OAuth client secret
- SMTP password
- AI provider keys

Use:

```yaml
envFrom:
  - secretRef:
      name: artistry-cart-secrets
```

## ConfigMap Versus Secret

ConfigMap:

```text
non-sensitive config
```

Secret:

```text
sensitive values
```

Important:

> Kubernetes Secrets are not a complete secret-management solution by themselves. Production systems should also consider encryption at rest, RBAC, external secret managers, and rotation.

## Environment Variables

Containers receive config through env vars.

Example:

```yaml
env:
  - name: NODE_ENV
    value: production
  - name: PORT
    value: "8080"
```

## Service DNS

Inside Kubernetes, services can be reached by DNS names.

Example:

```text
auth-service
product-service
order-service
```

Gateway can call internal services through service DNS instead of localhost.

## Interview Explanation

If asked "How do you manage config in Kubernetes?", say:

> I use ConfigMaps for non-sensitive configuration and Secrets for sensitive values. Deployments load them as environment variables or mounted files. Public traffic is handled through Ingress and edge-facing services, while internal backend services stay behind ClusterIP services.

## Connection To Artistry Cart

Artistry Cart uses:

- `k8s/base/configmap.yaml`
- `k8s/base/secrets.example.yaml`
- `k8s/base/ingress.yaml`
- envFrom references in Deployments

The README instructs creating a real `artistry-cart-secrets` Secret before applying overlays.

