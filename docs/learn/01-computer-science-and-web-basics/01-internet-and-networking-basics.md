# Internet And Networking Basics

## The First-Principles Idea

The internet is a global network of computers that communicate using agreed protocols.

At the simplest level:

```text
client computer -> network -> server computer
```

A browser is a client. An API service is a server. The internet is the communication system between them.

## What Is A Client?

A client is the side that starts the request.

Examples:

- browser opening `https://example.com`
- mobile app calling an API
- frontend app calling `GET /product`
- backend service calling another backend service
- Postman sending a test request

In Artistry Cart:

- `user-ui` acts as a client when it calls the API gateway.
- `seller-ui` acts as a client when it calls seller/product/order APIs.
- `api-gateway` acts as a client when it proxies requests to backend services.

## What Is A Server?

A server is a program or machine that listens for requests and returns responses.

Examples:

- Next.js server serving frontend pages
- Express API listening on port `8080`
- MongoDB listening on port `27017`
- Redis listening on port `6379`
- Kafka broker listening on port `9092`

In Artistry Cart:

- `api-gateway` is an Express server.
- `auth-service`, `product-service`, `order-service`, `recommendation-service`, and `aivision-service` are backend servers.
- `user-ui` and `seller-ui` are Next.js applications with server-side behavior.

## IP Address

An IP address identifies a machine or network interface.

Example:

```text
127.0.0.1
localhost
192.168.1.10
```

For local development, `localhost` usually points to your own machine.

In this repo, common local addresses include:

```text
http://localhost:3000  user-ui
http://localhost:3001  seller-ui
http://localhost:8080  api-gateway
http://localhost:6001  auth-service
http://localhost:6002  product-service
http://localhost:6004  order-service
```

## Port

A port identifies which program on a machine should receive traffic.

Think:

```text
IP address = building address
port = apartment number inside the building
```

If several services run on your machine, each needs a different port.

Example:

```text
localhost:8080 -> api-gateway
localhost:6001 -> auth-service
localhost:6002 -> product-service
```

## DNS

DNS means Domain Name System.

It converts human-friendly names into IP addresses.

Example:

```text
www.google.com -> server IP address
```

Without DNS, users would need to remember IP addresses.

Interview answer:

> DNS is like the internet's phonebook. The browser asks DNS to resolve a domain name into an IP address, then it can connect to the server at that address.

## TCP

TCP means Transmission Control Protocol.

It provides reliable communication between two machines.

TCP gives:

- connection setup
- ordered delivery
- retransmission if packets are lost
- flow control

HTTP usually runs on top of TCP.

Interview answer:

> TCP is the reliable transport layer. Before HTTP data is sent, the client and server establish a TCP connection so bytes can be delivered in order and retransmitted if needed.

## TLS

TLS means Transport Layer Security.

It provides:

- encryption
- server identity verification
- protection against tampering

HTTPS means HTTP over TLS.

Interview answer:

> TLS is the security layer that makes HTTPS possible. It encrypts traffic and lets the browser verify that it is talking to the real server, not an attacker.

## HTTP

HTTP means HyperText Transfer Protocol.

It defines how clients and servers exchange requests and responses.

Example:

```http
GET /products HTTP/1.1
Host: api.artistrycart.com
```

The server responds with:

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

## Full Connection Flow

When you open a website:

```text
1. Browser checks cache.
2. Browser resolves domain using DNS.
3. Browser opens TCP connection to server IP and port.
4. Browser performs TLS handshake if HTTPS is used.
5. Browser sends HTTP request.
6. Server processes request.
7. Server sends HTTP response.
8. Browser renders or uses the response.
```

## Interview Explanation

If asked, "What happens when you type a URL in the browser?", say:

> The browser first parses the URL and checks cache. It resolves the domain through DNS to get an IP address. Then it opens a TCP connection to the server, performs a TLS handshake for HTTPS, sends an HTTP request, receives an HTTP response, and renders the returned HTML, CSS, JavaScript, or data. If the page calls APIs, those requests go through the same basic network flow.

## Common Failure Points

Failures can happen at every layer:

- DNS cannot resolve the domain
- TCP connection is refused
- TLS certificate is invalid
- server times out
- API returns `500`
- browser blocks request due to CORS
- authentication cookie is missing
- network is slow or unstable

Senior engineers debug by identifying which layer failed.

## Connection To Microservices

In a microservices system, network calls happen not only between browser and backend, but also between services.

Example:

```text
user-ui -> api-gateway -> product-service -> MongoDB
```

Each arrow can fail, so production systems need:

- timeouts
- retries
- health checks
- logs
- metrics
- tracing

