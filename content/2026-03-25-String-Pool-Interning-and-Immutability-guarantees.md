---
title: "String Pool,Interning and Immutability guarantees"
date: "2026-03-25"
tags: [ "Java","Core"]
category: "java"
sessions:
  - date: "2026-03-25"
    startTime: "14:00"
    endTime: "14:14"
---


# Java String Pool, Interning, and Immutability - Interview Revision

## 1. Immutability Guarantees
In Java, `String` objects are completely immutable. Once a `String` object is created in memory, its state (the sequence of characters) cannot be changed. 

**Why does Java make Strings immutable?**
* **Security:** Strings are used for sensitive data (database URLs, network connections, file paths). If they were mutable, a reference passed to another method could be maliciously or accidentally altered.
* **Thread Safety:** Because they cannot change, Strings are inherently thread-safe. Multiple threads can share the same String object without synchronization overhead.
* **Caching Hashcodes:** Since the value never changes, a String's hashcode is calculated once and cached. This makes Strings incredibly fast and efficient as keys in a `HashMap`.
* **Enabling the String Pool:** Immutability is the foundational requirement for the String Pool to exist. If Strings could change, sharing them across the application would be disastrous.

## 2. The String Pool (String Intern Pool)
The String Pool is a highly optimized, special storage area located inside the general Java **Heap** memory (moved from PermGen to the main Heap in Java 7). 

It implements the **Flyweight Design Pattern** by storing only one copy of each distinct string value, drastically reducing memory consumption in applications that use a lot of repetitive text.

* **String Literals:** Any string created using double quotes (e.g., `String s = "Hello";`) is automatically placed in the String Pool.
* **The `new` Keyword:** Using `new String("Hello")` bypasses the pool optimization. It forces the JVM to create a brand new object in the general Heap space, even if "Hello" already exists in the pool.

## 3. String Interning (`intern()` method)
The `intern()` method is a native method used to interact manually with the String Pool. 

When you call `myString.intern()`:
1.  The JVM checks if an exact match of `myString` already exists in the String Pool.
2.  **If it exists:** It returns the memory reference to the object inside the pool.
3.  **If it does not exist:** It adds the string to the pool and returns the new pool reference.

---

## 4. Interview Input / Output Challenges

Below are classic senior-level I/O questions testing the nuances of compile-time vs. runtime String evaluation.

### Challenge 1: Literals vs. The `new` Keyword
```java
String s1 = "Java";
String s2 = "Java";
String s3 = new String("Java");

System.out.println(s1 == s2); 
System.out.println(s1 == s3); 
```
**Output:**
* `true`
* `false`

**Explanation:** `s1` and `s2` point to the exact same literal in the String Pool. `s3` forces a new object creation in the general Heap, so its memory address is different.

### Challenge 2: Compile-Time vs. Runtime Concatenation
```java
String s1 = "CodeEngine";
String s2 = "Code" + "Engine";

String part = "Code";
String s3 = part + "Engine";

System.out.println(s1 == s2); 
System.out.println(s1 == s3); 
```
**Output:**
* `true`
* `false`

**Explanation:** * `s1 == s2` is `true` because `"Code" + "Engine"` are both literals. The Java compiler optimizes this at compile-time (Constant Folding) and places `"CodeEngine"` directly into the pool.
* `s1 == s3` is `false`. Because `part` is a variable, the compiler cannot guarantee its value. The concatenation happens at **runtime** (using a `StringBuilder` under the hood), and the resulting object is placed in the general Heap, not the pool.

### Challenge 3: The `final` Keyword Optimization
```java
String s1 = "Spring Boot";
final String framework = "Spring";
String s2 = framework + " Boot";

System.out.println(s1 == s2);
```
**Output:**
* `true`

**Explanation:** Because `framework` is declared as `final`, the compiler knows its value will never change. It performs Constant Folding at compile-time, treating `framework + " Boot"` exactly the same as `"Spring" + " Boot"`, resulting in a direct reference to the String Pool.

### Challenge 4: Applying `intern()`
```java
String s1 = "Developer";
String temp = "Dev";
String s2 = temp + "eloper"; 
String s3 = s2.intern();

System.out.println(s1 == s2); 
System.out.println(s1 == s3); 
```
**Output:**
* `false`
* `true`

**Explanation:** `s2` is created at runtime and lives in the Heap. When `s2.intern()` is called, the JVM finds `"Developer"` already sitting in the String Pool (from `s1`) and assigns that pool reference to `s3`. Therefore, `s1` and `s3` share the exact same memory address.
