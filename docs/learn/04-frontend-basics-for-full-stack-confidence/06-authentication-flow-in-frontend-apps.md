# Authentication Flow In Frontend Apps

## Frontend Auth Mental Model

Frontend auth answers:

```text
Should this UI show logged-in behavior?
Should this route redirect?
Should this API request include credentials?
```

Backend auth answers:

```text
Is this request actually authenticated?
Is this user allowed to perform this action?
```

The backend is the source of truth.

## Login Flow

Typical login flow:

```text
1. User enters email/password.
2. Frontend validates basic fields.
3. Frontend sends login request to auth API.
4. Backend verifies credentials.
5. Backend sets cookie or returns token.
6. Frontend updates auth state or refetches user.
7. User is redirected to intended page.
```

## Cookie-Based Auth In Frontend

If backend uses HttpOnly cookies:

- JavaScript cannot read the token
- browser sends cookie automatically
- frontend uses `withCredentials` or credentials config when needed

Fetch example:

```ts
fetch("/auth/me", {
  credentials: "include",
});
```

Axios example:

```ts
axios.create({
  withCredentials: true,
});
```

## Token-Based Auth In Frontend

Bearer token flow:

```http
Authorization: Bearer <access_token>
```

Frontend must attach token to API calls.

Important risk:

> Tokens stored in localStorage can be stolen if XSS occurs.

HttpOnly cookies are usually safer for browser-based apps.

## Protected Routes

Protected frontend routes improve UX.

Example:

```text
If not logged in, redirect /profile -> /login
```

But this is not security by itself.

Backend must still reject unauthorized API requests.

## Role-Based UI

Role-based UI shows different navigation/actions.

Examples:

- buyer sees wishlist and checkout
- seller sees product dashboard
- admin sees moderation tools

Important:

> Hiding a button is not authorization. The backend must enforce permissions.

## Auth State

Frontend may store:

- current user summary
- role
- loading auth status
- whether auth check has completed
- redirect target

It should not store:

- password
- secret keys
- long-lived sensitive tokens in unsafe storage

## Refresh Token Flow

Common flow:

```text
1. Access token expires.
2. API request returns 401.
3. Frontend calls refresh endpoint or backend refreshes via cookie.
4. New access token/session is issued.
5. Original request may retry.
6. If refresh fails, user logs in again.
```

Be careful to avoid infinite retry loops.

## Logout Flow

Logout should:

- call backend logout endpoint
- clear server-side session or refresh token if used
- clear auth cookies
- clear frontend auth state
- redirect to public page

Frontend-only logout is incomplete if backend session/token remains valid.

## OAuth Frontend Flow

Simplified:

```text
1. User clicks Continue with Google.
2. Frontend navigates to backend OAuth route.
3. Backend redirects to provider.
4. Provider redirects back to backend callback.
5. Backend creates session/tokens.
6. User returns to frontend authenticated.
```

OAuth secrets must stay on backend.

## Common Auth UI States

Auth-aware UI needs:

- checking session
- logged out
- logged in
- unauthorized
- forbidden
- token expired
- refresh failed
- redirecting

## Interview Explanation

If asked "How does frontend authentication work?", say:

> The frontend collects credentials and calls the auth API. The backend verifies identity and issues a cookie or token. The frontend then includes credentials in future API calls and uses auth state to show the right routes and UI. However, route hiding and UI checks are only for user experience; the backend must still validate authentication and authorization on every protected request.

## Connection To Artistry Cart

In Artistry Cart:

- `auth-service` owns login, registration, OAuth, cookies, and tokens.
- `user-ui` uses auth-aware buyer flows like profile, wishlist, checkout, and orders.
- `seller-ui` needs seller-authenticated dashboard access.
- `packages/middleware` helps backend services enforce auth and roles.
- frontend route protection improves UX, but backend middleware enforces real security.

