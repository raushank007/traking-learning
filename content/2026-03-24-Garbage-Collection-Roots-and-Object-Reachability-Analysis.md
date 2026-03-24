---
title: "Java Garbage Collection: Roots & Reachability Analysis"
date: "2026-03-24"
tags: ["Garbage Collection", "Java","Core GC"]
summary: "In Java, the Garbage Collector (GC) does not guess what to delete. It actively traces live objects starting from specific, inherently safe points called **GC Roots**. If an object cannot be reached by following a chain of references from a GC Root, it is considered 'dead' and its memory is reclaimed."
category: "java"
sessions:
  - date: "2026-03-24"
    startTime: "17:15"
    endTime: "17:30"
---

# Java Garbage Collection: Roots & Reachability Analysis

## 1. The Core Concept: Reachability Analysis
In Java, the Garbage Collector (GC) does not guess what to delete. It actively traces live objects starting from specific, inherently safe points called **GC Roots**. If an object cannot be reached by following a chain of references from a GC Root, it is considered "dead" and its memory is reclaimed.

## 2. The Analogy: The City Power Grid ⚡
To easily visualize and explain this in an interview, use the power grid analogy:
* **GC Roots (Power Plants) 🌱:** The absolute sources of power. Always active.
* **Objects (Buildings) 🏠:** Instances of classes in the heap that need power to stay alive.
* **References (Power Lines) 🔌:** The variables connecting objects and transmitting the "power."

If the main line connecting a building (or neighborhood) to the power plant is cut, those buildings lose power and are demolished by the cleanup crew (the GC), regardless of whether they are still connected to each other.

## 3. What are the GC Roots in Java?
During an interview, you should be able to list the primary types of GC Roots:
1. **Local Variables & Parameters:** Variables active in currently executing methods (stack frames).
2. **Active Java Threads:** The execution threads themselves.
3. **Static Variables:** References held by loaded classes.
4. **JNI References:** Native code references.

## 4. The "Island of Isolation" Trap
An Island of Isolation occurs when two or more objects reference each other, but lack any connection back to a GC Root. 

```java
Employee e1 = new Employee("Charlie");
Employee e2 = new Employee("Diana");

// Objects reference each other (Extension cord between houses)
e1.setColleague(e2);
e2.setColleague(e1);

// Disconnected from GC Roots (Main power line severed)
e1 = null;
e2 = null; 
```
**Interview Answer:** Even though they reference each other, both `e1` and `e2` are eligible for garbage collection because they are unreachable from any GC Root.

## 5. Developer Interaction (Crucial Interview Gotchas)
* **`System.gc()`:** This is only a *suggestion* to the JVM to run the garbage collector. The JVM's memory management algorithms make the final decision. You cannot force a GC cycle.
* **`finalize()`:** The GC calls this method right before destroying an object. **Important:** Mention that this is *deprecated since Java 9* because it is unpredictable, impacts performance, and can accidentally resurrect objects. Use `try-with-resources` or `AutoCloseable` instead.


Now that we have this reference sheet built, let's complete the picture by looking at the heap itself. 

Going back to the question I posed just before: what dictates whether a surviving object lives its life in the **Young Generation** 🐣 versus the **Old Generation** 👴 within the JVM?