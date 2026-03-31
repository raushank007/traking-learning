---
title: "ReentrantLock, ReadWriteLock and StampedLock"
date: "2026-03-31"
tags: ["Java", "Concurrency", "Multithreading", "Lock"]
summary: "Deep dive into ReentrantLock, ReadWriteLock, and StampedLock, exploring Writer Starvation, Optimistic Locking, and performance trade-offs."
category: "java"
sessions:
  - date: "2026-03-31"
    startTime: "19:40"
    endTime: "20:00"
---

# Topic Revision Log: ReentrantLock, ReadWriteLock, and StampedLock

## 1. Core Concept & Analogy

* **Analogy:** * `ReentrantLock`: A giant padlock on the front door. Only one person inside at a time, regardless of what they are doing.
  * `ReadWriteLock`: A room with two keys. Infinite people can hold the "Read" key simultaneously, but the "Write" key requires the room to be completely empty.
  * `StampedLock`: A museum with an "Optimistic" policy. Tourists (Readers) look at the exhibit while the janitor (Writer) cleans it. Tourists just check the clock before they leave; if the clock changed while they were looking, they throw away their notes and look again.
* **TL;DR:** As systems scale, pure mutual exclusion (`ReentrantLock`) creates massive bottlenecks. `ReadWriteLock` improves read throughput but introduces "Writer Starvation" under heavy load. Java 8's `StampedLock` solves this via Lock-Free Optimistic Reading, making it the most performant choice for high-read, low-write systems like caches and config managers.

---

## 2. Deep Dive Details

* **Writer Starvation:** In a `ReadWriteLock`, if a continuous stream of Readers keeps entering the lock, the room is never "empty." A Writer waiting for an exclusive lock will be starved forever, breaking background update processes.
* **Optimistic Locking (`StampedLock`):** The thread reads the data *without* acquiring a heavy OS lock. It just grabs a numeric "Stamp" (representing the state of the lock). After reading, it calls `validate(stamp)`. If a Writer acquired a write lock during the read, the stamp is invalidated, and the Reader falls back to a traditional pessimistic lock.
* **Continuous Validation Failure (Thrashing):** In write-heavy systems, an optimistic read will almost always fail `validate(stamp)`. The system wastes CPU cycles attempting optimistic reads, only to constantly fall back to heavy pessimistic reads anyway.
* **The SDE 3 Golden Rule of Locks:**
  * **`ReentrantLock`:** Your default choice. Great for general-purpose thread safety and moderate concurrency.
  * **`ReadWriteLock`:** Good for high-read/low-write, but strictly beware of Writer Starvation.
  * **`StampedLock`:** The absolute king of massive-read/ultra-rare-write systems (like reading server configuration or routing tables).
* **Edge Cases:** `StampedLock` is **not** reentrant! If a thread holds a `StampedLock` write lock and calls another method that tries to acquire the same write lock, it will deadlock itself.

---

## 3. Implementation / Architecture Notes (Java)

```java
import java.util.concurrent.locks.StampedLock;

public class UltraHighThroughputCache {
    private double price = 0.0;
    private final StampedLock lock = new StampedLock();

    // WRITER: Gets an exclusive lock, updates the "Stamp"
    public void updatePrice(double newPrice) {
        long stamp = lock.writeLock(); 
        try {
            price = newPrice;
        } finally {
            lock.unlockWrite(stamp);
        }
    }

    // READER: Optimistic approach
    public double getPrice() {
        // 1. Get a stamp, DO NOT lock the door!
        long stamp = lock.tryOptimisticRead(); 
        double currentPrice = price; 
        
        // 2. VALIDATE: Did a writer change the data while I was copying?
        if (!lock.validate(stamp)) {
            // 3. FALLBACK: Writer modified data. Use heavy pessimistic lock.
            stamp = lock.readLock(); 
            try {
                currentPrice = price; 
            } finally {
                lock.unlockRead(stamp);
            }
        }
        return currentPrice;
    }
}
```

---

## 4. Company Specific Interview Questions

* **Question:** "We have an in-memory cache using a `ReadWriteLock`. We get 50,000 reads per second. A background thread updates the cache every 5 minutes. We noticed the background thread keeps timing out and failing to update. Why?"
  * **Company:** Amazon
  * **Key Approach:** Identify the problem as **Writer Starvation**. Explain that because 50,000 readers are constantly holding the shared read lock, the lock never reaches a state of 0 readers, meaning the write lock can never be acquired. Propose migrating to `StampedLock` using optimistic reads so readers do not block the writer.

* **Question:** "In a high-frequency trading engine, prices update 1,000 times a second. Should we use a `StampedLock` with optimistic reading for the pricing engine?"
  * **Company:** Citadel / Bloomberg
  * **Key Approach:** No. Explain the concept of **Thrashing**. Because writes happen so frequently, an optimistic read will almost always fail `validate(stamp)`. The system will waste CPU cycles attempting optimistic reads, only to constantly fall back to heavy pessimistic reads anyway. A standard `ReentrantLock` or a lock-free `AtomicReference` would be better here.

---

## 5. Exact Unedited Discussion Transcript

**Candidate:** Now teach me ReentrantLock, ReadWriteLock and StampedLock

**Coach:** Excellent pivot. Moving from basic intrinsic locks to the evolution of advanced locking mechanisms (`ReentrantLock` -> `ReadWriteLock` -> `StampedLock`) is a classic SDE 3 journey. What do you already know about these three locks, and what specific areas usually trip you up?

**Candidate:** ReentrantLock use the allow only one thread to work at a time in the block with it written in try lock and when new thread come to execute the same block it doesn't paused the thread , to make it wait, it continue doing other work and once the task is complete I will notify ReadWriteLock give more flexibility

**Coach:** You have the right spirit about `tryLock()`, but I need to make one critical SDE 3 correction! `ReentrantLock.tryLock()` does **not** notify you when the lock becomes free. It is a strictly synchronous, instant check. If it returns false, the JVM forgets about you. You have to manually poll again later.

**The Analogy: The Shared Google Doc**
* `ReentrantLock` is a giant padlock. It locks everyone out, even if you just want to read.
* `ReadWriteLock` gives two keys: The Read Key (Shared—infinite readers) and the Write Key (Exclusive—room must be totally empty).

**Code: HighThroughputCache**
```java
public String get(String key) {
    readLock.lock();
    try { return cache.get(key); } finally { readLock.unlock(); }
}
public void put(String key, String value) {
    writeLock.lock();
    try { cache.put(key, value); } finally { writeLock.unlock(); }
}
```

**The SDE 3 Challenge: The Starvation Trap**
If you have 50,000 reads per second, and 1 background thread trying to write an update... what happens to the Writer thread? What is the industry term for this, and why is `ReadWriteLock` dangerous here?

**Candidate:** Based on the above flow , it might be the write process not happen or its sequence will break if the event is trigger by user

**Coach:** You hit the absolute bullseye! You just described **Writer Starvation**. Because new Readers keep walking in before old Readers leave, the room is *never* empty. The Writer waits for hours.

Instead, we use Java 8's **`StampedLock`**.
**The Analogy:** An Optimistic museum. Tourists (Readers) look at the exhibit while the janitor (Writer) cleans it. The system stamps their ticket. Before leaving, the tourist checks the clock. If the janitor changed the exhibit, the clock changes, and the tourist knows to throw away their notes and read it again.

**Code: Optimistic Reading**
```java
long stamp = lock.tryOptimisticRead(); 
double currentPrice = price; 
if (!lock.validate(stamp)) {
    // A writer modified the data! Fallback to a heavy lock.
    stamp = lock.readLock(); 
    try { currentPrice = price; } finally { lock.unlockRead(stamp); }
}
```

**The Final Socratic Challenge:**
Imagine a high-frequency stock trading engine where Writers update the price every millisecond. If you deploy this `StampedLock` code, what catastrophic performance degradation happens to Readers, and why?

**Candidate:** as it is write heavy evey second it is keep updating, then read will always check the clock and do the read again and agian

**Coach:** Spot on once again! You just described exactly why we don't use Optimistic Locking for write-heavy systems. This failure mode is often called **Thrashing** or **Continuous Validation Failure**.

If the janitor is swapping out the museum exhibit every single millisecond, the tourist (Reader) will *always* find out the clock has changed.
1. The Reader tries an Optimistic Read -> Fails validation.
2. The Reader falls back to a heavy, pessimistic `readLock()`.
3. BUT, because the Writers are constantly acquiring the `writeLock()`, the Reader gets stuck waiting in line anyway!

You end up wasting CPU cycles doing useless optimistic reads, only to end up blocked in the exact same queue you were trying to avoid.