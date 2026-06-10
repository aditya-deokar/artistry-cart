# State Management, Forms, And Validation

## What State Is

State is data that changes over time.

Frontend state examples:

- search text
- selected filters
- cart drawer open/closed
- form input values
- logged-in user
- current tab
- loading flag
- API response data

## Types Of Frontend State

### Local UI State

Belongs inside one component.

Examples:

- modal open
- selected tab
- input focus

Use:

```ts
useState
```

### Shared Client State

Used across multiple components.

Examples:

- cart drawer state
- auth user state
- theme

Use:

- React context
- Zustand
- Jotai
- other state stores

### Server State

Data owned by the backend but displayed in frontend.

Examples:

- products
- orders
- profile
- recommendations

Server state needs:

- fetching
- caching
- refetching
- invalidation
- loading/error handling

## Avoid Overusing Global State

Do not put everything in global state.

Good local state:

```text
dropdown open/closed
form draft value
current tab
```

Good server state:

```text
products loaded from API
orders loaded from API
```

Good global state:

```text
auth session summary
cart state
theme
```

## Forms

Forms collect user input.

Examples:

- login form
- signup form
- checkout form
- product creation form
- discount creation form
- contact form

Forms need:

- input state
- validation
- submit handling
- loading state
- error messages
- success behavior

## Controlled Form Inputs

```tsx
const [email, setEmail] = useState("");

return (
  <input
    value={email}
    onChange={(event) => setEmail(event.target.value)}
  />
);
```

Controlled inputs are useful when React needs to manage every change.

## React Hook Form

React Hook Form is commonly used for complex forms.

It helps with:

- form state
- validation
- field registration
- errors
- performance

This repo uses form tooling in frontend apps.

## Validation

Frontend validation checks:

- required fields
- email format
- password length
- price is positive
- date range is valid
- file type/size

Backend validation must still repeat important checks.

Interview answer:

> Frontend validation improves UX. Backend validation enforces correctness and security.

## Form Submit Flow

```text
user enters values
  -> frontend validates
  -> submit button shows loading
  -> API request sent
  -> backend validates and processes
  -> frontend handles success or error
  -> UI updates
```

## Optimistic Updates

Optimistic update means updating UI before the server confirms.

Example:

```text
User clicks wishlist.
UI immediately shows selected.
API request runs in background.
If request fails, UI reverts.
```

Benefits:

- faster perceived UX

Costs:

- must handle failure rollback
- can confuse users if overused

## Derived State

Calculate values instead of storing duplicates.

Example:

```ts
const subtotal = items.reduce((sum, item) => {
  return sum + item.price * item.quantity;
}, 0);
```

Do not store `subtotal` separately unless needed.

## Common Form Mistakes

- no loading state
- no disabled state during submit
- errors disappear too quickly
- backend validation errors not shown near fields
- submitting duplicate requests
- trusting frontend validation only
- form state spread across too many components
- using global state for temporary form drafts unnecessarily

## Interview Explanation

If asked "How do you manage state in React?", say:

> I separate local UI state, shared client state, and server state. Local component state is good for small interactions. Shared state is useful for auth, cart, theme, or app-wide UI. Server state should usually be fetched and cached through an API layer. For forms, I validate on the client for user experience and on the backend for correctness.

## Connection To Artistry Cart

Frontend state appears in:

- cart and wishlist drawers
- auth store
- AI Vision session state
- seller product forms
- discount and event forms
- order tables and filters
- search and product filtering
- checkout and payment forms

