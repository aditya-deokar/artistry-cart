# Authorization, RBAC, Ownership, And Middleware

## Role-Based Access Control

RBAC means Role-Based Access Control.

Users have roles. Routes require roles.

Example roles:

- buyer
- seller
- admin

Example:

```text
seller route requires seller role
admin route requires admin role
```

## Role Check Is Not Enough

Role checks answer:

```text
Is this user a seller?
```

Ownership checks answer:

```text
Does this seller own this product?
```

Both are needed.

Example:

```text
seller A should not edit seller B's product
```

## Permission-Based Access

Permissions are more granular than roles.

Example:

```text
product:create
product:update
order:refund
admin:read
```

Large systems often move from simple roles to permissions.

## Middleware Authorization

Middleware can enforce generic checks.

Examples:

```text
isAuthenticated
authorizedRoles("seller")
isAdmin
```

Middleware should handle cross-cutting checks.

Service-specific checks should stay in service logic.

## Ownership Authorization

Ownership checks usually need database access.

Example:

```text
product-service checks product.sellerId === req.user.sellerId
```

This belongs in the service that owns the product domain.

## Defense In Depth

Security should have multiple layers:

- frontend route protection
- backend auth middleware
- role checks
- ownership checks
- input validation
- database constraints/indexes
- audit logs

If one layer fails, another can still protect the system.

## Least Privilege

Least privilege means users/services get only the permissions they need.

Examples:

- buyer cannot access seller dashboard APIs
- seller can only manage own products
- service account can only access required resources
- CI secrets scoped to environment

## Interview Explanation

If asked "How do you implement authorization?", say:

> I separate generic authorization from domain-specific ownership checks. Middleware can verify authentication and roles, but services must enforce business permissions such as whether a seller owns a product or a user owns an order. Frontend checks improve UX, but backend checks enforce security.

## Connection To Artistry Cart

In Artistry Cart:

- `packages/middleware` can share auth/role checks
- `product-service` should enforce seller product ownership
- `order-service` should enforce buyer/seller order access
- `seller-ui` can hide UI, but backend services must reject forbidden requests

