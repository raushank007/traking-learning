---
title: "Latency vs Throughput (P99, P90 metrics)"
date: "2026-03-17"
tags: ["HLD", "Network & Communication","Basic"]
summary: ""
category: "HLD"
sessions:
  - date: "2026-03-17"
    startTime: "22:53"
    endTime: "23:01"
---

### 1. Latency vs. Throughput: The Highway Analogy
The easiest way to understand the difference is to think of a highway with a toll booth.

* **Latency (Time):** This is the time it takes for a *single car* to travel from Point A, get through the toll booth, and reach Point B. In system design, latency is the time it takes for a single request to go from the client, get processed by the server, and return a response (usually measured in milliseconds).
* **Throughput (Volume):** This is the *number of cars* that can pass through the toll booth in one hour. In system design, throughput is the number of requests your system can handle over a specific period (this is the QPS—Queries Per Second—we calculated earlier).

**The Relationship:** They are not exactly opposites, but they affect each other. If you increase throughput by pushing too much traffic into the system without scaling your servers, a "traffic jam" happens. Requests sit in a queue waiting for CPU time, and as a result, **latency spikes**.

### 2. The Trap of "Average" Latency
If you build an API and the monitoring dashboard says the "Average Latency is 50ms," it sounds great. But averages lie.

Imagine you process 10 requests:
* 9 requests take **10ms** each.
* 1 request hits a database lock, a slow network retry, or a garbage collection pause, and takes **410ms**.

The average latency is exactly **50ms**. If you only look at the average, you think your system is blazing fast. In reality, 10% of your traffic is experiencing a massive half-second delay. This is why engineers at high-scale companies ignore the average and look at **Percentiles**.

### 3. Understanding Percentiles (P50, P90, P99)
Percentiles sort all your requests from fastest to slowest and tell you exactly what the user experience is like at different tiers.



* **P50 (The Median):** If your P50 latency is 20ms, it means **50% of your requests** are faster than 20ms, and 50% are slower. This gives you a much better baseline of the "typical" user experience than the average.
* **P90:** If your P90 latency is 80ms, it means **90% of your requests** are faster than 80ms. Only the slowest 10% take longer.
* **P99:** If your P99 latency is 500ms, it means **99% of your requests** are faster than 500ms. The remaining 1% are the absolute slowest outliers.
* **P99.9 (The "Three Nines"):** 99.9% of requests are faster than this. Only 1 in 1,000 requests is slower.

### 4. Why P99 is the Golden Metric
You might think, *"Who cares about 1% of users getting a slow response?"* At scale, 1% is enormous. If you have 10 million requests a day, 1% is **100,000 requests** suffering from terrible performance.

Furthermore, modern web pages don't just make one request. Loading a single social media feed might require 50 different microservice calls (fetching the user profile, fetching the posts, fetching the images, fetching the likes).

If a microservice has a bad P99 (meaning 1 out of 100 requests is slow), and your web page makes 50 requests to load, the probability of the user experiencing at least one slow request jumps to roughly **40%**. This is called **Tail Latency Amplification**. One slow backend service drags down the entire user experience.

---

### Summary for your Cheat Sheet:
* **Latency:** Time to process one request (Aim for low).
* **Throughput:** Number of requests processed per second (Aim for high).
* **P50:** The middle-ground user experience.
* **P99:** The worst-case user experience (excluding extreme anomalies). Optimizing P99 is the key to building resilient, professional-grade systems.