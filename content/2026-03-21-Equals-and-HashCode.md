---
title: "Equals and HashCode"
date: "2026-03-21"
tags: ["Java", "Core"]
summary: "This is a critical concept that interviewers test to ensure you understand object comparison and how hash-based collections function under the hood."
category: "java"
sessions:
  - date: "2026-03-21"
    startTime: "14:00"
    endTime: "14:10"
---


### The Golden Rule (The Contract)

The relationship between these two methods boils down to one strict rule and one strong recommendation:
* ⚖️ **The Strict Rule:** If two objects are equal according to the `equals(Object)` method, then calling the `hashCode()` method on each of the two objects **must** produce the same integer result.
* ⚡ **The Recommendation:** If two objects are unequal according to `equals(Object)`, they are *not* required to produce distinct integer results. However, producing distinct results for unequal objects improves the performance of hash tables (like `HashMap`).

### The `equals()` Mandates

Interviewers often ask what properties a proper `equals()` implementation must have. It must be an equivalence relation:
* 🟢 **Reflexive:** `x.equals(x)` must return `true`.
* 🟢 **Symmetric:** `x.equals(y)` must return `true` if and only if `y.equals(x)` returns `true`.
* 🟢 **Transitive:** If `x.equals(y)` is `true` and `y.equals(z)` is `true`, then `x.equals(z)` must return `true`.
* 🟢 **Consistent:** Multiple invocations of `x.equals(y)` consistently return `true` or consistently return `false`, provided no information used in equals comparisons is modified.
* 🟢 **Non-null:** For any non-null reference value `x`, `x.equals(null)` must return `false`.

### Interview Hotspots



When discussing this in an interview, you should be prepared to explain **why** this contract exists. It entirely revolves around collections like `HashMap`, `HashSet`, and `Hashtable`.

* 🚨 **The "Forgotten HashCode" Trap:** The most common interview question is: *"What happens if you override `equals()` but not `hashCode()`?"*
    * **The Answer:** If you use instances of this class as keys in a `HashMap`, you will "lose" data. Even if two keys are logically equal, the default `hashCode()` (derived from the memory address) will place them in different hash buckets. The map will fail to find the object you just put in.
* 🚨 **Hash Collisions:** Interviewers will ask: *"What happens if two different objects return the same hash code?"*
    * **The Answer:** This is a collision. The `HashMap` will place both objects in the same bucket (usually as a linked list or, in Java 8+, a balanced tree). When retrieving, the map uses the hash code to find the bucket, and then uses `equals()` to iterate through that bucket and find the exact matching object.

### Standard Java Implementation

Here is how you standardly implement this contract in Java:

```java
import java.util.Objects;

public class Employee {
    private int id;
    private String department;

    // Constructors, getters, setters omitted for brevity

    @Override
    public boolean equals(Object o) {
        // 1. Check for reference equality
        if (this == o) return true;
        
        // 2. Check for null and exact class match (or instanceof depending on inheritance needs)
        if (o == null || getClass() != o.getClass()) return false;
        
        // 3. Cast and compare state
        Employee employee = (Employee) o;
        return id == employee.id && Objects.equals(department, employee.department);
    }

    @Override
    public int hashCode() {
        // Use java.util.Objects utility to generate a hash based on the same fields used in equals()
        return Objects.hash(id, department);
    }
}
```