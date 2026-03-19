---
title: "CAP Theorem & PACELC"
date: "2026-03-19"
tags: ["HLD", "Trade off"]
summary: "Define Consistency, Availability, and Partition Tolerance. Understand why a distributed system can only guarantee two out of the three at any given time."
category: "HLD"
sessions:
  - date: "2026-03-19"
    startTime: "16:00"
    endTime: "16:30"
---



### ⚖️ CAP Theorem

A distributed system can strictly guarantee only two of three traits at the same time:
* **C**onsistency: Every read receives the most recent write or an error.
* **A**vailability: Every request receives a successful response, but without the guarantee that it contains the absolute latest data.
* **P**artition Tolerance: The system continues to operate even if the network fails and communication between servers is broken.

**The Real-World Choice:** Because network failures (P) are inevitable, you are always choosing between:
* **CP (Prioritizes Accuracy):** * *Example:* A Bank ATM network. It will display "Out of Service" (sacrificing availability) rather than risk an inconsistent account balance.
* **AP (Prioritizes Uptime):** * *Example:* An e-commerce shopping cart. It will always let you add items (sacrificing consistency temporarily) to avoid losing a sale, syncing the data later.

### 🧭 PACELC Theorem

PACELC extends CAP to describe the trade-offs during *normal* operations when the network is healthy:
* **If P**artition: Choose between **A**vailability or **C**onsistency.
* **E**lse (Normal Operation): Choose between **L**atency or **C**onsistency.

**Common Configurations:**
* **PA/EL (Eventual Consistency):** Highly available during failures, and prioritizes blazing-fast speed (Latency) during normal operations.
    * *Example:* A social media "Like" counter.
* **PC/EC (Strong Consistency):** Prioritizes perfect accuracy during failures, and accepts slower responses (Latency) during normal operations to ensure data is synced.
    * *Example:* A core banking ledger.
