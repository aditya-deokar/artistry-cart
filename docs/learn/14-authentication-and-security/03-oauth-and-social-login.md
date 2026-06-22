# OAuth And Social Login

## What OAuth Is

OAuth is an authorization framework that lets users grant an application access through a trusted provider.

Common providers:

- Google
- GitHub
- Facebook

In login flows, OAuth is often used to prove identity through a provider.

## Why OAuth Exists

OAuth lets users sign in without sharing their provider password with your app.

Your app redirects the user to the provider, and the provider returns a trusted result.

## Simplified OAuth Login Flow

```text
1. User clicks "Continue with Google".
2. App redirects user to Google.
3. User grants permission.
4. Google redirects back to backend callback with a code.
5. Backend exchanges code for provider tokens/user info.
6. Backend finds or creates local user.
7. Backend issues app session/cookies/tokens.
8. User returns to frontend logged in.
```

## Authorization Code

The authorization code is temporary.

Backend exchanges it with the provider for tokens/user info.

The code should not be treated as a long-lived credential.

## Redirect URI

The redirect URI is where provider sends user after authorization.

It must match configured allowed callback URLs.

Example:

```text
https://api.example.com/auth/oauth/google/callback
```

## State Parameter

The `state` parameter helps protect against CSRF-like attacks in OAuth.

Flow:

```text
backend creates random state
user goes to provider with state
provider returns same state
backend verifies it
```

## Local User Account

OAuth provider identity is not the same as your app user.

Your app should map provider identity to local user.

Example:

```text
google provider id -> local user id
```

## Provider Tokens

Provider access/refresh tokens should be protected.

Do not expose provider secrets or tokens to frontend unless specifically required and safe.

## Common OAuth Bugs

- missing state validation
- wrong redirect URI
- storing provider secrets in frontend
- account linking bugs
- duplicate accounts for same email
- trusting unverified email
- leaking provider tokens

## Interview Explanation

If asked "How does OAuth login work?", say:

> The user is redirected to a trusted provider such as Google. After consent, the provider redirects back to the backend with an authorization code. The backend exchanges that code for provider user information, maps it to a local user account, and then issues the app's own session or tokens. The frontend should not handle provider secrets.

## Connection To Artistry Cart

Artistry Cart's `auth-service` includes OAuth-related behavior and provider configuration. The backend owns provider secrets, callback handling, user mapping, and issuing local app tokens/cookies.

