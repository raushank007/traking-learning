---
title: "Concurrent HashMap"
date: "2026-03-14"
tags: ["Java", "Collections"]
summary: "Concurrent HashMap internal work"
category: "java"
sessions:
  - date: "2026-03-14"
    startTime: "13:46"
    endTime: "14:07"
---


### 🗺️ `ConcurrentHashMap`


### Topic 1: The Baseline - Why `Hashtable` Fails at Scale

Before diving into the complex locking mechanisms of `ConcurrentHashMap`, we have to establish the exact problem it was designed to solve.

Older thread-safe map implementations, specifically `Hashtable` and `Collections.synchronizedMap()`, achieve thread safety through a very coarse-grained approach: **method-level synchronization**.

Under the hood, almost every method in a `Hashtable` is marked with the `synchronized` keyword. This means the lock is placed on the entire map object itself.

* **The Bottleneck:** If Thread A is executing a `put("key1", "value1")` operation, it holds the intrinsic lock for the entire `Hashtable` instance.
* **The Consequence:** While Thread A holds that lock, no other thread can read, write, or update *any* part of the map.

In a multi-threaded environment with high throughput, this single-lock design causes massive thread contention and forces threads to queue up, essentially reducing the system to single-threaded performance. `ConcurrentHashMap` solves this by introducing fine-grained locking, allowing simultaneous operations.

>To make sure we are solid on this baseline before moving to the Java 7 architecture: If you have a system that is overwhelmingly read-heavy (e.g., 99% reads and 1% writes), how exactly does the architecture of Hashtable penalize those read operations when that rare write occurs?
> Because synchronized locks the entire object, even simultaneous reads—which don't modify any data—are forced to wait in a single-file line if another thread happens to be reading or writing.

---

### Topic 2: Java 7 Internals - Segment-based Locking (Lock Striping)

To fix the massive bottleneck of a single global lock, the architects of Java 7's `ConcurrentHashMap` introduced a technique called **Lock Striping**.

Instead of treating the map as one giant locked vault, they divided the map into an array of smaller, independent sections called **Segments**. By default, a `ConcurrentHashMap` was created with 16 segments.

Here is how it worked under the hood:

* Each `Segment` acted like its own miniature hash table.
* Crucially, each `Segment` had its own independent lock (specifically, the `Segment` class extended `ReentrantLock`).
* When a thread wanted to write a key-value pair, the map would first hash the key to figure out *which* segment that key belonged to, and then it would only lock that specific segment.

>Let's apply this architecture to a high-throughput scenario to see how it performs. If Thread A wants to execute `put("key1", "value1")` which hashes to Segment 3, and Thread B wants to execute `put("key2", "value2")` which hashes to Segment 8, what happens when they try to execute at the exact same millisecond, and why?
> Because they hash to different segments (Segment 3 and Segment 8), Thread A and Thread B acquire completely separate locks. They don't block each other at all, and both writes happen simultaneously.

---

### Topic 3: Java 8+ Internals - Node-based Locking

While Java 7's lock striping was a massive improvement, it still had a flaw. If two threads hashed to the *same* segment but wanted to write to different, independent buckets within that segment, one thread still had to wait. Furthermore, maintaining all those `Segment` and `ReentrantLock` objects consumed unnecessary memory.

In Java 8, the architects completely removed the `Segment` class. Instead, they shifted to the most granular locking possible: **Node-level locking**.

Instead of locking a whole section of the map, Java 8+ locks only the specific "bucket" or "bin" (the head node of the linked list or red-black tree) where the key-value pair is going to be placed.

To achieve this high performance, Java 8 utilizes two main mechanisms depending on the state of the bucket:

1. **CAS (Compare-And-Swap):** Used when the bucket is currently empty.
2. **`synchronized` block:** Used on the head node when the bucket already contains data (a collision).

>Let's break down the CAS mechanism first, as it is a highly testable interview concept. When a thread attempts to insert a new node into an empty bucket using CAS, how exactly does the "Compare-And-Swap" hardware-level operation ensure thread safety without using a traditional lock?

It isn't just about reducing the *number* of steps; CAS makes the check and the update a **single, indivisible hardware-level operation** (atomic). There is physically no "middle" for another thread to interrupt.

Here is the exact flow for an empty bucket in `ConcurrentHashMap`:

1. The thread executes a `CAS(bucket_index, expected_value, new_value)` instruction.
2. It expects the `bucket_index` to be `null` (empty).
3. In one single CPU cycle, it checks if the bucket is `null`. If it is, it drops the `new_node` in.
4. If the bucket is *not* `null` (meaning another thread beat it by a nanosecond), the CAS operation fails safely, and the thread knows it needs to try a different strategy.

---

### Topic 4: Lock-Free Reads

This brings us to one of the most powerful features of `ConcurrentHashMap`: **`get()` operations generally do not block.**

Whether the map uses Java 7 segments or Java 8 node locks for writing, read operations bypass these locks almost entirely. Threads can retrieve data concurrently even while other threads are actively modifying the map.

>To make this possible without returning stale or incorrect data, the architects relied on a specific mechanism for memory visibility across threads. If Thread A updates a node's value, and Thread B immediately tries to read it without acquiring a lock, what specific Java keyword applied to the node's fields ensures Thread B sees the most up-to-date value instead of a locally cached version?
> The val (the actual value) and next (the pointer to the next node in a collision) fields inside the Node class are declared as volatile.
>This guarantees a strict "happens-before" relationship at the memory level. When one thread updates a value, it flushes straight to main memory, and any subsequent read by another thread pulls directly from main memory, completely bypassing CPU caches.


