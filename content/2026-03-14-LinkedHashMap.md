---
title: "LinkedHashMap"
date: "2026-03-14"
tags: ["Java", "Collections"]
summary: "LinkedHashMap internal work"
category: "java"
sessions:
  - date: "2026-03-14"
    startTime: "14:27"
    endTime: "14:42"
---


### 🗺️ `LinkedHashMap` & LRU Cache Interview Roadmap

### Topic 1: The Baseline Problem - Why standard `HashMap` falls short

To understand why `LinkedHashMap` exists, we must first look at the inherent trade-off made by a standard `HashMap`.

A `HashMap` is optimized purely for speed. It guarantees $O(1)$ time complexity for `get()` and `put()` operations under ideal conditions. However, to achieve this, it distributes keys across its internal array (buckets) based entirely on their generated hash codes.

* **The Problem:** This hashing process is inherently chaotic regarding order. If you insert "Apple", "Banana", and "Cherry" into a `HashMap`, iterating through the map later might yield "Cherry", "Apple", "Banana". The map has complete amnesia regarding the sequence of your actions.
* **The Consequence:** In many real-world system design scenarios—such as building a history feature, processing items in the exact sequence they arrived, or building a cache eviction policy—losing track of order is unacceptable.

We need the lightning-fast $O(1)$ lookups of a `HashMap`, but we also need the strict ordering of a `List`.

>how data structures are built at the memory level. If we want to maintain the exact sequence in which elements were added to our map without sacrificing our $O(1)$ lookup time, how must `LinkedHashMap` physically modify the standard `HashMap` node to achieve this?

It isn't just storing the "bucket address." Instead, `LinkedHashMap` modifies the actual node itself. It uses a custom `Entry` class that extends the standard `HashMap.Node` and simply adds two new pointers: `before` and `after`.

By doing this, every single key-value pair exists in **two data structures simultaneously**:

1. **The Hash Table Array:** For the lightning-fast $O(1)$ lookups.
2. **The Global Doubly-Linked List:** To strictly track the sequence of the elements, weaving through the nodes regardless of which bucket they live in.

---

### Topic 3: Insertion Order vs. Access Order

This brings us to the most critical feature of `LinkedHashMap` when it comes to system design and caching.

By default, `LinkedHashMap` maintains **Insertion Order**. The first thing you put in is the first thing you get out when iterating (like a queue).

However, `LinkedHashMap` has a special constructor that accepts a boolean flag called `accessOrder`.

If you set `accessOrder = true`, the map completely changes its behavior. It no longer just tracks when things were *inserted*; it tracks when things were *used*. Every single time you read a value using `get()`, or update an existing value using `put()`, that specific node is immediately ripped out of its current position and moved to the very end (the tail) of the doubly-linked list.

* **Head of the list:** Contains the Least Recently Used (LRU) element.
* **Tail of the list:** Contains the Most Recently Used (MRU) element.

>let's test the mechanics of this toggle. If `accessOrder` is set to `true`, and you call `get("Banana")` on a node currently sitting perfectly in the middle of the doubly-linked list, what specific pointer updates must happen under the hood to move "Banana" to the tail?

If our list is `Apple <-> Banana <-> Cherry`, and we access "Banana", here are the exact steps:

1. **Bridge the Gap:** "Apple"’s `after` pointer is updated to point to "Cherry". "Cherry"’s `before` pointer is updated to point to "Apple". Now they are linked: `Apple <-> Cherry`.
2. **Attach to Tail:** The current tail's `after` pointer is updated to point to "Banana". "Banana"’s `before` pointer is updated to point to the old tail.
3. **Update Tail Reference:** "Banana" becomes the new tail.

### Topic 4: Building an LRU Cache - Overriding `removeEldestEntry()`

Now we arrive at the core interview question: turning this data structure into an actual LRU Cache.

A cache cannot grow infinitely; it must have a maximum capacity. When it reaches that capacity, it needs to evict the oldest, least-used item to make room for new data. `LinkedHashMap` was explicitly designed with this use case in mind.

It provides a protected method called `removeEldestEntry(Map.Entry<K, V> eldest)`.

Here is the secret to how it works: Every single time you call `put()` to insert a new key-value pair, `LinkedHashMap` internally calls `removeEldestEntry()` immediately afterward.

* If the method returns `false` (which is the default behavior), nothing happens. The map keeps growing.
* If the method returns `true`, the map automatically deletes the head of the doubly-linked list (the LRU element).

To finish building our LRU Cache for the interview, you need to create a custom class that extends `LinkedHashMap`. If you are given a requirement that the cache must hold exactly `MAX_CAPACITY` elements (e.g., 100), what exactly would you write inside the `removeEldestEntry()` method to enforce this eviction policy?

You have the exact right logic for *when* to evict, but here is the magic of `LinkedHashMap` that interviewers love to see: **you do not actually have to write the code to remove the head element yourself!**

The `removeEldestEntry(Map.Entry<K, V> eldest)` method expects you to return a simple `boolean`. If you return `true`, the `LinkedHashMap` automatically snips off the head of the doubly-linked list (the LRU element) for you under the hood.

So, inside your custom cache class, your overridden method literally becomes a single line of code:

```java
@Override
protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
    return size() > MAX_CAPACITY; 
}

```

That is all it takes! Every time a new item is inserted, the map checks this condition. If the size is now 101 (and your max was 100), this returns `true`, and the map instantly deletes the oldest entry.

---
