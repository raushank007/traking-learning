---
title: "Scalability"
date: "2026-03-21"
tags: ["HLD", "Trade off"]
summary: "Understand Scalability term"
category: "HLD"
sessions:
  - date: "2026-03-21"
    startTime: "17:00"
    endTime: "17:10"
---

# HLD System Design: Scalability 🚀

## 1. Vertical Scaling (Scaling Up) 🏗️
* **Concept:** Adding more power (CPU, RAM, Storage) to a single, existing server.
* **Pros:** Simple architecture; no code changes required.
* **Cons:** Hard physical hardware limits; usually requires downtime to upgrade; single point of failure.

## 2. Horizontal Scaling (Scaling Out) 🌐
* **Concept:** Adding more servers (nodes) to the resource pool to distribute the load.
* **Pros:** Virtually infinite scalability; high availability (no single point of failure); zero downtime upgrades.
* **Cons:** Increased system complexity (requires load balancing, complex state management, and distributed databases).

## Quick Comparison 📊

| Feature | Vertical Scaling | Horizontal Scaling |
| :--- | :--- | :--- |
| **Action** | Upgrade hardware | Add more machines |
| **Downtime** | Yes (usually) | No |
| **Limit** | Hardware constraints | Infinite |
| **Complexity** | Low | High |
