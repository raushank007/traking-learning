---
title: "API Gateway"
date: "2026-03-07"
tags: ["HLD", "Network & Communication"]
summary: "API Gateways are a core component in modern distributed systems."
category: "HLD"
sessions:
  - date: "2026-03-07"
    startTime: "00:00"
    endTime: "00:45"
---

# API Gateway

## Core Concepts & The "Why"

An API Gateway serves as the single entry point-much like a front desk at a hotel-for all external requests attempting to access a system's microservices.

**Problem** : In a system without a gateway, a client(like a mobile app) must manage multiple endpoints, handle network failures for each service independently, and make multiple round trips over the failures for each service independently, and make multiple round trips over the internet to fetch data from different domians. This is often called the "client-side microservices" anti-pattern.

The gateway solves this by decoupling the client from the underlying microservices topology,The client only needs to know the gateway's address. When a request arrives, the gateway handles it, potentially fans out to multiple backend services, aggregates the results, and sends a single, unified response back to the client.

**Question 1**
>If a mobile app needs to load a dashboard that displays both user profile data and recent orders, how exactly does the API Gateway improve the network performance for the mobile client compared to the app making direct calls to the separate 'User' and 'Order' microservices?

**Answer**
1. **The Problem(The Anti-Pattern):** Without a gateway, the mobile app suffers from the 'client-side microservices' anti-pattern. It is forced to make multiple separate network requests to fetch the user profile and the recent orders.
2. **The Solution (The Gateway):** The API Gateway solves this by acting as a single entry point, allowing the mobile client to request all necessary dashboard data with just one call.
3. **The Physics(The "Why"):** This drastically improves performance because the mobile app only makes one round-trip over the slow, unreliable public internet. The gateway handles the multiple fan-out calls to the 'User' and 'Order' services over the data center's high-speed, low-latency internal network.
4. **The Bonus (Industry Terms):** This specific architectural approach of fetching and combining multiple internal data sources for a client UI is known as the Aggregator or Backend-For-Frontend (BFF) pattern

## Key Responsibilities : 
Security(AuthN/AuthZ), Routing, and Rate Limiting

**Security:** Centralizes authentication so backend services focus on business logic. 
**Rate Limiting:** Protects against spikes. Example: Token Bucket algorithm (smooth continuous refill) vs Fixed Window (bursty). 
**Protocol Translation:** Converts client JSON (text) into internal gRPC (compressed binary). This is CPU-intensive and requires horizontal scaling.

>Global apps deploy gateways at the Edge to reduce latency and avoid a Single Point of Failure. Example: A Tokyo user connects to a Tokyo gateway. It handles auth and translation locally, so only fast binary data travels across the ocean.

## Interview Scenarios
**Edge Caching** is used for massive read-heavy traffic spikes. Example: During a Black Friday TV sale, millions of users check the same TV price. The edge gateway caches the price in memory and serves it directly, protecting internal databases.