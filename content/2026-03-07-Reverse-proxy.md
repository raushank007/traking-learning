---
title: "Reverse Proxy"
date: "2026-03-07"
tags: ["HLD", "Network & Communication","API Gateway"]
summary: "API Gateways are a core component in modern distributed systems."
category: "HLD"
sessions:
  - date: "2026-03-07"
    startTime: "08:29"
    endTime: "09:29"
---

# Reverse Proxy

A **reverse Proxy** is a server that sits in front of backend applications servers and act as the single entry point for clients.

Instead of clients talking directly to backend services, they talk to the reverse proxy, which forwards the request internally.
```mermaid
sequenceDiagram
    client ->> Reverse Proxy : 
    Reverse Proxy ->> Backend servers: 
```

A reverse proxy is **opposite of a forward proxy**, where the proxy represents the client.

## Why Do companies use reverse Proxies?

| Need                 | Why                                                                                     |
|----------------------|-----------------------------------------------------------------------------------------|
| Load Balancing       | Distributed traffic across multiple instances(round-robin, least connections, IP-hash). |
| Security Layer       | Hide backend IPs, prevent DDoS, rate-limit, filter malicious traffic.                   |
| SSL/TLS Termination  | Offload CPU-heavy TLS handshakes from application servers.                              |
| Caching              | Serve static content without hitting backend(Nginx/Cloudfare).                          |
| Routing/ API Gateway | Send/api/user to service A, /api/cart to service B.                                     |
| Centralized Logging  | Track requests before they reach downstream services.                                   |

## How a Reverse Proxy Works Internally

Let's break down what happens when a client sends a request:
**Step-by-Step flow:**
1. DNS resolves domain to reverse proxy IP. Example: api.example.com -> 34.121.10.11(Nginx/HAProxy/Envoy)
2. Reverse proxy receives the request on port 80/443
3. Proxy performs : Check routing rules, Apply rate limiting/filters, SSL termination, Authentication checks
4. Load balancing decision 
5. Forward request to backend server
6. Receive response from backend
7. Modify/ compress/ cache if enabled
8. Return response to client

## Reverse Proxy vs API Gateway vs Load Balancer

1. **Reverse Proxy(The Bouncer):**  Protects the network. It handles generic web traffic tasks that require zero knowledge of your business logic.
2. **Load Balancer(The Traffic Cop):** Distributes incoming traffic evenly across a pool of healthy servers so no single machine gets overwhelmed.
3. **API Gateway(The Front desk):** Understands your actual business logic. It knows about user tokens, specific microservice endpoints, and data payloads.

## Where Reverse Proxy Fits in a Microservices Architecture
```mermaid
sequenceDiagram
    client ->> CDN : route
    CDN ->> Reverse Proxy/ API Gateway : route
    Reverse Proxy/ API Gateway ->> Service Mesh : route
    Service Mesh ->> Microservices : route
```

## Questions 
>When a mobile app sends a secure, encrypted HTTPS request to your system, the server needs to decrypt it (a CPU-intensive process called SSL Termination). Given the roles defined previously, which component—the Reverse Proxy at the edge, or the internal API Gateway—should ideally handle decrypting this traffic, and why?

1. **Direct Answer:** SSL Termination should be handled at the edge by the Reverse Proxy.
2. **The Security Reason:** "Architecturally, we want to intercept and decrypt public internet traffic at the outermost perimeter before it enters our trusted internal network."
3. **The Performance Reason:** Decrypting HTTPS is incredibly CPU-intensive. By offloading this to a lightweight Reverse Proxy like Nginx, we free up the API Gateway's CPU to focus purely on business logic like authentication and protocol translation.
4. **Industry Term:** This pattern is known as SSL Offloading or SSL Termination.




