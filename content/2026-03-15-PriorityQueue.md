---
title: "Priority Queue"
date: "2026-03-15"
tags: ["Java", "Collections"]
summary: "PriorityQueue and Ordering in Java,"
category: "java"
sessions:
  - date: "2026-03-15"
    startTime: "12:18"
    endTime: "12:30"
---

Certainly! Here is a structured summary of **PriorityQueue** and **Ordering** in Java, formatted for your `.md` log file.

---

# 📝 Java PriorityQueue & Ordering Notes

### 1. PriorityQueue (PQ) Basics 🏗️

* **Data Structure**: Implemented as a **Binary Heap** stored in a dynamically resizing array.
* **Ordering**: Elements are ordered according to their **priority**, not their insertion order.
* **Default Behavior**: Java’s `PriorityQueue` is a **Min-Heap** 🧊 by default (the smallest element is at the head).
* **Complexity**:
* `offer()` / `poll()`: $O(\log n)$
* `peek()`: $O(1)$


* **Internal Storage**: For an element at index `i`:
* `Left Child`: `2i + 1`
* `Right Child`: `2i + 2`
* `Parent`: `(i - 1) / 2`



### 2. Comparable vs. Comparator ⚖️

| Feature | `Comparable<T>` | `Comparator<T>` |
| --- | --- | --- |
| **Type** | Internal (Class implements it) | External (Separate logic) |
| **Method** | `compareTo(T other)` | `compare(T o1, T o2)` |
| **Purpose** | Defines "Natural Ordering" | Defines custom/multiple orderings |
| **Flexibility** | One fixed implementation | Can define many for one class |

### 3. Comparison Logic Rules 📏

* **Negative Result**: First element is "smaller" (comes first).
* **Zero**: Elements are equal.
* **Positive Result**: First element is "larger" (comes later).
* **Best Practice**: Use `Integer.compare(x, y)` instead of `x - y` to avoid integer overflow 🚩.

---

### 4. Implementation Example (Java) ☕

```java
// Max-Heap using a Lambda Comparator
PriorityQueue<Integer> maxHeap = new PriorityQueue<>((a, b) -> Integer.compare(b, a));

// Custom Object Ordering (Natural Order)
public class Patient implements Comparable<Patient> {
    private int severity;
    
    @Override
    public int compareTo(Patient other) {
        // High severity (10) should come before low severity (1)
        return Integer.compare(other.severity, this.severity);
    }
}

```

---

### 5. Common Interview Patterns 💡

* **Top-K Elements**: Use a Min-Heap of size $K$ to find the $K$ largest elements.
* **K Closest Points**: Use a Max-Heap to keep the $K$ smallest distances (evicting the largest).
* **Merge K Sorted Lists**: Use a Min-Heap to track the head of each list.

---