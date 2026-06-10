# Browser To Server Request Lifecycle

## The Big Picture

A web request is a conversation:

```text
browser asks -> server answers
```

For example:

```text
Browser: Give me product details for product 123.
Server: Here is the JSON data for product 123.
```

In real systems, the flow has many steps.

## Example: Opening A Product Page

Imagine a buyer opens:

```text
https://artistrycart.com/products/123
```

The high-level flow:

```text
Browser
  -> Next.js frontend
  -> API gateway
  -> product-service
  -> MongoDB
  -> product-service
  -> API gateway
  -> Next.js frontend
  -> Browser
```

## Step-By-Step

### 1. Browser Parses The URL

The browser identifies:

```text
protocol: https
domain: artistrycart.com
path: /products/123
```

If the URL contains a query string:

```text
/products?category=handmade&page=2
```

the browser includes that in the HTTP request.

### 2. Browser Resolves DNS

The browser needs the server IP address.

It checks:

- browser DNS cache
- operating system DNS cache
- router/ISP DNS
- recursive DNS resolver

Final result:

```text
artistrycart.com -> server IP address
```

### 3. Browser Opens A TCP Connection

The browser connects to the server IP and port.

Common ports:

```text
80   HTTP
443  HTTPS
3000 local Next.js app
8080 local API gateway
```

### 4. TLS Handshake Happens For HTTPS

For HTTPS:

- browser validates server certificate
- client and server negotiate encryption
- future HTTP data is encrypted

This protects:

- login credentials
- cookies
- tokens
- checkout information
- personal data

### 5. Browser Sends HTTP Request

Example:

```http
GET /products/123 HTTP/1.1
Host: artistrycart.com
Accept: text/html
Cookie: access_token=...
User-Agent: Chrome
```

Important parts:

- method: `GET`
- path: `/products/123`
- headers: metadata
- cookies: auth/session data
- body: optional data for methods like `POST`

### 6. Frontend Server Or Static Host Responds

For a Next.js app, the request may be handled by:

- static assets
- server-rendered route
- server component
- route handler
- middleware

The frontend may also call backend APIs to fetch data.

### 7. API Request Goes To Gateway

The frontend may call:

```text
GET /product/products/123
```

The API gateway receives the request and routes it to the correct backend service.

Example:

```text
/product/* -> product-service
/auth/* -> auth-service
/order/* -> order-service
```

### 8. Backend Service Runs Middleware

Express middleware may handle:

- request logging
- CORS
- JSON body parsing
- cookie parsing
- authentication
- authorization
- validation
- rate limiting

Middleware runs before the final route handler.

### 9. Controller Or Route Handler Runs

The route handler decides what business operation is needed.

Example:

```text
GET /products/123
```

Handler:

- reads product id from params
- validates input
- calls service/repository logic
- fetches data from database
- returns response

### 10. Database Query Runs

The service queries MongoDB through Prisma.

Example:

```text
find product where id = 123
```

The database returns data or an error.

### 11. Response Travels Back

The backend sends JSON:

```json
{
  "id": "123",
  "name": "Handmade Vase",
  "price": 4200
}
```

The response travels:

```text
product-service -> api-gateway -> frontend/browser
```

### 12. Browser Updates UI

The browser:

- parses HTML
- downloads CSS and JavaScript
- executes JavaScript
- renders UI
- updates state with API response

## API Request Lifecycle In Express

Typical Express request flow:

```text
request
  -> global middleware
  -> route-specific middleware
  -> controller
  -> service logic
  -> database/external API
  -> response
  -> error middleware if something fails
```

This matters because bugs often happen in a specific layer.

## What An Interviewer Wants To Hear

They want to know that you can reason across layers.

Strong answer:

> A browser request starts with URL parsing and DNS resolution. Then the browser opens a TCP connection, performs TLS for HTTPS, sends an HTTP request, and receives a response. In a modern app, that initial frontend response may trigger API calls. In our project, API calls go through the gateway, which routes to services like product-service or auth-service. The service runs middleware, validates the request, executes business logic, queries MongoDB through Prisma, then returns JSON back through the gateway to the frontend.

## Debugging By Layer

If the user says "the page is not working", ask:

- Is DNS resolving?
- Is the frontend running?
- Is the API gateway reachable?
- Is the backend service healthy?
- Is CORS blocking the browser?
- Is authentication missing?
- Is the database connected?
- Is the route returning the expected status code?
- Is the frontend handling the response correctly?

## Connection To Artistry Cart

Example local product request:

```text
user-ui on localhost:3000
  -> api-gateway on localhost:8080
  -> product-service on localhost:6002
  -> MongoDB on localhost:27017
```

Example auth request:

```text
seller-ui on localhost:3001
  -> api-gateway on localhost:8080
  -> auth-service on localhost:6001
  -> MongoDB/Redis/SMTP/OAuth provider
```

