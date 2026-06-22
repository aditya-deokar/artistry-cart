# Request Flows Through The System

## Why Request Flows Matter

Interviewers want to know whether you can explain how a real user action moves through the system.

Strong answers include:

- entry point
- gateway behavior
- owning service
- database/external dependency
- response path
- failure/security considerations

## Flow 1: Buyer Browses Products

```text
Buyer browser
  -> user-ui
  -> api-gateway
  -> product-service
  -> MongoDB through Prisma
  -> product-service
  -> api-gateway
  -> user-ui
  -> browser UI
```

What happens:

1. buyer opens product/shop/search page
2. frontend requests product data
3. gateway routes `/product` traffic to product service
4. product service validates query/filter params
5. service reads products/shops from MongoDB
6. response returns to frontend
7. UI renders product cards, filters, pagination, or empty/error states

Key interview point:

> Product browsing is synchronous because the user needs an immediate response.

## Flow 2: User Login

```text
Browser
  -> user-ui or seller-ui
  -> api-gateway
  -> auth-service
  -> MongoDB/Redis/OAuth/SMTP depending on flow
  -> cookie/token response
```

What happens:

1. user submits credentials or starts OAuth
2. frontend sends request to auth route
3. gateway forwards to auth service
4. auth service verifies identity
5. token/cookie/session behavior is applied
6. frontend updates auth-aware UI or redirects

Key interview point:

> Frontend route protection is UX. Backend middleware must enforce real auth and authorization.

## Flow 3: Seller Creates Product

```text
Seller browser
  -> seller-ui
  -> api-gateway
  -> product-service
  -> MongoDB/ImageKit if media involved
  -> seller-ui updates dashboard
```

What happens:

1. seller fills product form
2. frontend validates basic fields
3. API request includes auth credentials
4. backend verifies seller role/identity
5. product service validates product input
6. product is persisted
7. dashboard updates list or redirects to product detail

Key interview point:

> Client validation improves UX, but product-service must validate and authorize the operation.

## Flow 4: Buyer Checkout

```text
Buyer browser
  -> user-ui
  -> api-gateway
  -> order-service
  -> Stripe
  -> MongoDB/Redis
  -> user-ui checkout state
```

What happens:

1. buyer submits checkout
2. order service validates cart/order input
3. service creates payment session or intent with Stripe
4. order/payment state is stored
5. frontend receives checkout/payment response
6. Stripe webhook later confirms final payment state

Key interview point:

> Payment confirmation should rely on webhooks, not only the foreground checkout request.

## Flow 5: Recommendation Request

```text
user-ui
  -> api-gateway
  -> recommendation-service
  -> MongoDB analytics/product data
  -> recommendation response
```

What happens:

1. frontend asks for recommendations
2. recommendation service reads materialized user activity
3. service scores or selects products
4. recommendations return synchronously

Key interview point:

> Analytics capture is async, but recommendation serving is currently synchronous.

## Flow 6: AI Vision Request

```text
user-ui
  -> api-gateway
  -> aivision-service
  -> AI provider/ImageKit/MongoDB
  -> AI Vision response
```

What happens:

1. user starts an AI Vision action
2. frontend sends prompt/image/session request
3. AI Vision service validates input and rate constraints
4. service calls AI provider or internal workflow
5. result is stored or returned

Key interview point:

> AI Vision is isolated because AI calls have different latency, cost, dependency, and failure characteristics.

## Flow 7: Gateway Failure

If downstream service fails:

```text
frontend -> api-gateway -> service down
```

Gateway should return a clear failure such as:

- `502 Bad Gateway`
- `503 Service Unavailable`
- `504 Gateway Timeout`

Frontend should show an error state or retry affordance.

## Interview Explanation

If asked "Walk me through a request", choose one flow and say:

> A buyer product request starts in `user-ui`, goes through the gateway, is routed to `product-service`, which validates inputs and reads MongoDB through Prisma, then returns JSON back through the gateway to the UI. The important design point is that the gateway handles routing, while product-service owns catalog logic and validation.

