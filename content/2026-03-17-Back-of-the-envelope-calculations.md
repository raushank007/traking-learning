---
title: "Back-of-the-envelope calculations (Estimations)"
date: "2026-03-17"
tags: ["HLD", "Network & Communication","Basic"]
summary: ""
category: "HLD"
sessions:
  - date: "2026-03-17"
    startTime: "22:00"
    endTime: "22:36"
---



### 1. The Magic Numbers (Time & Math Approximations)
Never use exact seconds or bytes in an interview. Always round to these standard approximations to keep your mental math fast and error-free.

| Metric | Exact Value | **Interview Approximation** |
| :--- | :--- | :--- |
| **Seconds in a Day** | 86,400 | **100,000** ($10^5$) |
| **Seconds in a Month** | 2,592,000 | **2.5 Million** ($2.5 \times 10^6$) |
| **Data: KB to MB** | 1,024 KB | **1,000 KB** ($10^3$) |
| **Data: MB to GB** | 1,024 MB | **1,000 MB** ($10^6$ KB) |
| **Data: GB to TB** | 1,024 GB | **1,000 GB** ($10^9$ KB) |

### 2. Traffic & Throughput (QPS)
Use these formulas to figure out how many requests your servers need to handle.

* **Total Daily Requests:** $Total = DAU \times Requests Per User$
* **Average QPS (Queries Per Second):** $Average QPS = Total Daily Requests \div 100,000$
* **Peak QPS:** $Peak QPS = Average QPS \times 2$ *(Note: Use $3\times$ or $5\times$ for highly spiky traffic, like a flash sale).*
* **Read-to-Write Ratio:** Determine the split. Social media is usually **10:1** or **100:1** (Read-heavy). Metrics logging is usually **1:10** (Write-heavy).

### 3. Storage & Database Capacity
Calculated primarily based on your **Write QPS**, as this represents the new data entering the system.

* **Daily Storage Growth:** $Daily Storage = Write QPS \times Size Per Write \times 100,000$
* **1-Year Storage:** $1 Year = Daily Storage \times 365$ *(Round up to 400 for easier math if needed)*
* **5-Year Storage (Standard Request):** $5 Year Storage = 1 Year Storage \times 5$

### 4. Memory & Caching (RAM)
Calculated primarily based on your **Read QPS**, as caching prevents heavy database reads.

* **Daily Read Volume:** $Daily Reads = Read QPS \times Size Per Read \times 100,000$
* **Cache Size (The 80/20 Rule):** Assume 20% of your data generates 80% of the traffic. You want to cache that 20%.
  $Cache Capacity = Daily Read Volume \times 0.2$

### 5. Network Bandwidth
Measures the data transfer rate to help size your load balancers and network interfaces.

* **Ingress (Incoming Data):** $Ingress = Write QPS \times Size Per Write$
* **Egress (Outgoing Data):** $Egress = Read QPS \times Size Per Read$

### 6. Standard Component Limits (The "Tripwires")
Compare your calculated numbers against these baselines. If your numbers exceed these limits, you *must* explain how you will scale the system (e.g., sharding, load balancing, cluster sizing).

| Component 🧩 | Metric | Standard Single-Node Limit 🛑 |
| :--- | :--- | :--- |
| **Application Server** | QPS | **100 - 1,000 QPS** (Depends on CPU vs I/O bounds) |
| **Relational DB (SQL)** | QPS | **1,000 - 3,000 QPS** |
| **Relational DB (SQL)** | Storage | **~10 TB** |
| **NoSQL Database** | QPS | **10,000+ QPS** (Highly scalable) |
| **Cache (e.g., Redis)** | QPS | **100,000+ QPS** |
| **Cache (e.g., Redis)** | Memory | **16 GB - 64 GB RAM** per node |
| **Network Interface** | Bandwidth | **~10 Gbps** (Gigabits per second) |

### 7. Important Latency Numbers

Knowing the massive difference in speed between memory and disk proves why caches are necessary.
* **Read from RAM (Memory):** 100 nanoseconds = **10⁻⁷ seconds** (100 × 10⁻⁹)
* **Read from SSD (Disk):** 100 microseconds = **10⁻⁴ seconds** (100 × 10⁻⁶)
* **Read from HDD (Disk):** 10 milliseconds = **10⁻² seconds** (10 × 10⁻³)
* **Send packet US to Europe and back:** 150 milliseconds = **1.5 × 10⁻¹ seconds** (150 × 10⁻³)

---


## 1. Application Server & Load Balancing Conclusions
Your **Peak QPS** dictates how you structure your compute layer. You use this number to determine if a single server is enough, or if you need a distributed cluster.

* **If Peak QPS < 1,000:** A single application server can handle the load.
* **If Peak QPS > 1,000:** You must conclude that a single server will crash. You need to introduce a **Load Balancer** and deploy multiple application servers horizontally.
* **Calculating Server Count:** You can divide your Peak QPS by 1,000 to tell the interviewer exactly how many servers you need to start with (e.g., 5,000 Peak QPS / 1,000 = 5 application servers minimum).



## 2. Database Selection Conclusions
Your **Write QPS** and **5-Year Storage** numbers dictate your entire database strategy. This is usually the biggest decision in the system design.

* **If Storage < 10 TB and Write QPS < 2,000:** You can confidently choose a **Relational Database (SQL)** like PostgreSQL or MySQL. It is simple, supports ACID transactions, and won't buckle under the load.
* **If Storage > 10 TB or Write QPS > 3,000:** A single SQL database will fail. You must conclude that you need to either use **Database Sharding** (splitting the SQL database across multiple machines) or choose a **Distributed NoSQL Database** (like Cassandra or DynamoDB) designed for massive scale and heavy writes.

## 3. Caching Strategy Conclusions
Your **Read QPS** and calculated **Cache Size (20% of daily reads)** tell you how to protect your database from being overwhelmed by read requests.

* **If Read QPS is significantly higher than Write QPS:** You must introduce an in-memory cache (like Redis or Memcached).
* **If Cache Size < 64 GB:** You can conclude that a single Redis node is enough to hold your cached data.
* **If Cache Size > 64 GB:** A single cache node will run out of memory. You must conclude that you need a **Distributed Cache Cluster** (multiple Redis nodes working together) to handle the volume.



## 4. Network & Content Delivery Conclusions
Your **Egress (Outgoing Data)** bandwidth tells you if your application servers will get bogged down trying to send heavy files over the network.

* **If Egress is mostly text/small JSON:** Your application servers can handle sending this data directly to the user.
* **If Egress is massive (due to images, videos, or heavy static assets):** You must conclude that you need a **Content Delivery Network (CDN)**. You will offload the heavy media files to the CDN, bringing the egress bandwidth on your main servers back down to a safe level.

---

### Summary Table for Component Decisions

| If your calculation shows... | You must conclude you need... |
| :--- | :--- |
| High Peak QPS | Load Balancer + Multiple App Servers |
| Massive 5-Year Storage (>10 TB) | NoSQL DB or SQL with Sharding |
| Heavy Read Traffic | Redis / Memcached Layer |
| High Memory Needs (>64 GB) | Distributed Cache Cluster |
| Heavy Outgoing Data (Images/Video)| Content Delivery Network (CDN) |
