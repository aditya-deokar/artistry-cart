# Frontend Mental Model

## What A Frontend Is

A frontend is the part of an application users directly interact with.

It is responsible for:

- displaying information
- collecting input
- handling interactions
- calling backend APIs
- showing loading/error/success states
- managing local UI state
- protecting user experience

In web apps, the frontend usually runs in the browser.

## Browser Responsibilities

The browser can:

- request HTML, CSS, JavaScript, images, and fonts
- render UI
- execute JavaScript
- store cookies and local/session storage
- send API requests
- enforce web security rules like CORS
- manage navigation history

The browser cannot be trusted with secrets.

Important rule:

> Anything sent to the browser can be inspected by the user.

## Frontend Versus Backend

Frontend responsibilities:

- UI rendering
- user interactions
- client-side validation
- optimistic UI
- route transitions
- accessibility
- browser state
- calling APIs

Backend responsibilities:

- authentication verification
- authorization enforcement
- trusted business logic
- database access
- secrets
- payment calls
- external provider calls
- durable state changes

## Client-Side Validation Versus Server-Side Validation

Client-side validation improves user experience.

Example:

```text
Show "email is invalid" before submitting the form.
```

Server-side validation protects the system.

Example:

```text
Reject invalid email even if the user bypasses frontend validation.
```

Interview answer:

> Frontend validation is for fast feedback. Backend validation is for security and correctness. You need both.

## Rendering

Rendering means turning data and components into visible UI.

In modern web apps, rendering can happen:

- in the browser
- on the server
- at build time
- through a mix of these

Next.js supports multiple rendering strategies.

## Static Versus Dynamic UI

Static UI:

- does not change often
- can be pre-rendered
- fast to serve

Dynamic UI:

- depends on user data
- depends on auth
- changes frequently
- may need server or client fetching

Example:

```text
Landing page hero -> mostly static
Seller order table -> dynamic
Profile page -> user-specific
```

## Loading, Empty, Error, And Success States

Real frontend apps need more than happy paths.

Common states:

- initial
- loading
- success
- empty
- validation error
- server error
- unauthorized
- forbidden
- retrying

Good UI explicitly handles these states.

## Frontend Security Basics

Frontend should not:

- store secret API keys
- trust hidden form values
- enforce authorization only in UI
- expose admin-only data in client bundles
- put private tokens in public variables

Frontend should:

- use HTTPS
- handle auth expiry
- avoid dangerous HTML rendering
- respect secure cookie behavior
- show safe error messages

## API Contract Thinking

Frontend and backend communicate through contracts.

A good contract defines:

- endpoint path
- method
- request body
- query params
- auth requirement
- response shape
- error shape

Full-stack confidence comes from understanding both sides of the contract.

## Interview Explanation

If asked "What does a frontend do?", say:

> A frontend renders the user interface, handles interactions, collects input, manages local UI state, and communicates with backend APIs. It improves user experience with client-side validation and loading/error states, but trusted business rules, authorization, secrets, and database changes must be enforced on the backend.

## Connection To Artistry Cart

In Artistry Cart:

- `user-ui` focuses on browsing, search, cart, checkout, profile, AI Vision, and buyer flows.
- `seller-ui` focuses on seller operations such as products, orders, discounts, offers, and events.
- backend services own trusted logic for auth, products, orders, recommendations, AI workflows, and analytics.

