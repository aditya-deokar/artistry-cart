# Common Web Security Risks

## XSS

XSS means Cross-Site Scripting.

It happens when attacker-controlled JavaScript runs in your app.

Risks:

- steal tokens from unsafe storage
- perform actions as user
- read sensitive page data
- modify UI

Defenses:

- escape output
- avoid unsafe HTML rendering
- sanitize user-generated HTML
- use HttpOnly cookies for sensitive tokens
- Content Security Policy

## CSRF

CSRF means Cross-Site Request Forgery.

It tricks a browser into sending an authenticated request using cookies.

Defenses:

- SameSite cookies
- CSRF tokens
- Origin/Referer checks
- custom headers for state-changing requests

## Injection

Injection happens when untrusted input is interpreted as code/query logic.

Examples:

- SQL injection
- NoSQL injection
- command injection
- template injection

Defenses:

- validation
- parameterized queries/ORM safe APIs
- avoid raw string-built queries
- least privilege

## Brute Force

Brute force tries many guesses.

Targets:

- login
- OTP
- password reset
- API keys

Defenses:

- rate limiting
- account lockout or throttling
- MFA where appropriate
- strong password rules
- monitoring suspicious attempts

## Broken Access Control

Broken access control happens when users can access data/actions they should not.

Examples:

- buyer reads another buyer's order
- seller edits another seller's product
- admin endpoint exposed to normal user

Defenses:

- backend authorization
- ownership checks
- tests for forbidden cases
- do not trust user-supplied ids

## Sensitive Data Exposure

Examples:

- logging tokens
- exposing password hash
- returning provider secrets
- putting secret keys in frontend env vars
- storing raw payment data

Defenses:

- redact logs
- use secure env/secrets
- return DTOs not raw database models
- keep secrets backend-only

## CORS Misconfiguration

CORS mistakes can break apps or weaken browser protections.

Risks:

- allow all origins with credentials
- wrong allowed origins
- missing allowed headers
- exposing cookies cross-site incorrectly

CORS is not authentication. It is browser read protection.

## Interview Explanation

If asked "What web security risks do you watch for?", say:

> I think about XSS, CSRF, injection, brute force, broken access control, sensitive data exposure, insecure cookies, CORS misconfiguration, and secret leakage. The key is validating input, enforcing backend authorization, protecting tokens/cookies, limiting abuse, and never trusting the browser for security decisions.

## Connection To Artistry Cart

Important risks:

- seller ownership checks
- auth cookie configuration
- checkout/payment security
- AI endpoint abuse/rate limits
- frontend public env variables
- secrets in `.env`
- safe DTO responses from services

