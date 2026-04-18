---
title: "Object memory layout and Object Header mechanics"
date: "2026-04-19"
tags: [ "Java","JVM Internals","Memory Management"]
summary: ""
category: "java"
sessions:
  - date: "2026-04-19"
    startTime: "07:30"
    endTime: "07:48"
---


When you write `new Object()`, you aren't just allocating memory for your variables. The JVM wraps your data in a highly engineered, invisible structure to manage garbage collection, concurrency, and class identity.

Assuming a standard 64-bit JVM with **Compressed Oops** enabled (the default for modern Java), here is the exact anatomical breakdown of an object in memory:

### 1. The Object Header (Usually 12 Bytes) 👑
Every single object, no matter how small, starts with a header. It consists of two parts:

* **The Mark Word (8 Bytes):** This is the Swiss Army knife of the JVM. It is a dynamic block of bits that changes its meaning depending on what the object is currently doing. It holds:
    * **Identity HashCode:** Generated the first time you call `.hashCode()`.
    * **GC Age:** The number of times the object has survived a Minor GC (max age is usually 15 before promotion to the Old Generation).
    * **Lock State:** This is how the `synchronized` keyword works! When a thread locks an object, the JVM literally flips bits inside this Mark Word to record which thread owns the lock (Biased, Lightweight, or Heavyweight locking).
* **The Klass Pointer (4 Bytes):** This is a pointer that points to the actual class metadata (the definitions of the methods, which live in Metaspace). It tells the JVM, "I am an instance of `User.class`." *(Note: Without Compressed Oops, this would be 8 bytes).*

### 2. Instance Data (Payload) 📦
Immediately following the header is the actual data you declared in your class. The JVM packs these tightly, usually sorting them by size to minimize wasted space:
* `long` / `double` = 8 bytes
* `int` / `float` = 4 bytes
* `short` / `char` = 2 bytes
* `byte` / `boolean` = 1 byte
* Object References (e.g., `String name`) = 4 bytes (thanks to Compressed Oops)

### 3. Alignment Padding (0-7 Bytes) 🧱
The JVM has a strict rule: **Every object's total memory size must be a multiple of 8 bytes.** If your object's header and payload add up to 17 bytes, the JVM will silently add 7 bytes of "padding" to bump the total size to 24 bytes. This ensures the CPU can read the object from RAM as efficiently as possible.

---

