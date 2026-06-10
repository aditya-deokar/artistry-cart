# Computer Science And Web Basics

This folder is the first learning block for preparing for a bigger engineering role. It covers the foundation every backend, full-stack, DevOps, and platform engineer should be able to explain clearly in interviews.

The goal is not to memorize definitions. The goal is to understand what happens when a user opens a website, sends an API request, logs in, receives a cookie, hits a protected route, or sees an error.

## Learning Outcome

After completing this topic, you should be able to explain:

- how the internet works at a high level
- what happens when a browser calls a server
- how DNS, TCP, TLS, HTTP, and HTTPS fit together
- what REST APIs are and why JSON is common
- how headers, cookies, and status codes work
- the difference between authentication and authorization
- how sessions, JWTs, and refresh tokens work
- why CORS and CSRF exist
- how environment variables and configuration support real deployments

## Files In This Topic

1. [Internet And Networking Basics](./01-internet-and-networking-basics.md)
2. [Browser To Server Request Lifecycle](./02-browser-to-server-request-lifecycle.md)
3. [HTTP, HTTPS, APIs, JSON, Headers, And Status Codes](./03-http-https-apis-json-headers-status-codes.md)
4. [Authentication, Authorization, Sessions, JWT, And Cookies](./04-authentication-authorization-sessions-jwt-cookies.md)
5. [CORS, CSRF, And Web Security Basics](./05-cors-csrf-and-web-security-basics.md)
6. [Environment Variables And Configuration](./06-environment-variables-and-configuration.md)
7. [Interview Questions And Answer Patterns](./07-interview-questions-and-answer-patterns.md)

## How To Study This Topic

Read in order. After each file, try explaining the concept out loud in plain English.

For interviews, your answer should usually follow this pattern:

```text
1. Define the concept simply.
2. Explain why it exists.
3. Walk through a real request flow.
4. Mention common tradeoffs or failure cases.
5. Connect it to a project example.
```

Example:

> HTTPS is HTTP over an encrypted TLS connection. It exists so clients can verify the server identity and send data privately. When a browser calls an API, DNS resolves the hostname, TCP connects to the server, TLS negotiates encryption, and then HTTP sends the request. In Artistry Cart, HTTPS would protect login tokens, cookies, checkout requests, and user data between the browser, gateway, and deployed services.

## Connection To Artistry Cart

These basics appear everywhere in this repo:

- `user-ui` and `seller-ui` make API requests from the browser/frontend layer.
- `api-gateway` receives HTTP requests and proxies them to backend services.
- `auth-service` handles login, cookies, JWTs, OAuth, and user identity.
- `product-service`, `order-service`, `recommendation-service`, and `aivision-service` expose API routes.
- `.env`, `.env.example`, Docker Compose, CI, and Kubernetes manifests rely on environment configuration.
- CORS, cookies, secrets, and headers are essential to safe frontend-backend communication.

