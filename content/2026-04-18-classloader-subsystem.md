---
title: "Classloader Subsystem(Bootstrap,Extension,App,Delegation Model)"
date: "2026-04-18"
tags: [ "Java","JVM Internals","Memory Management"]
summary: ""
category: "java"
sessions:
  - date: "2026-04-18"
    startTime: "07:30"
    endTime: "07:48"
---
# JVM Classloader Subsystem & Interview Topics: Mind Map

## 1. Classloader Hierarchy 🏗️
* **Bootstrap Classloader:** Written in native code. Loads core Java libraries (`java.lang.*`, `java.base`).
* **Extension/Platform Classloader:** Loads classes from Java extension directories.
* **Application Classloader:** Loads application-specific classes from the standard classpath.

## 2. Delegation Model (Parent-First) 🤝
* **Mechanism:** A classloader always delegates to its parent before attempting to load a class itself.
* **Interview Focus:** **Security**. It prevents malicious code from replacing trusted core classes (e.g., a hacker cannot supply a fake `java.lang.String`).

## 3. Classloading Exceptions 🚨
* **`ClassNotFoundException`:** Dynamic/Explicit loading failure. Happens when asking the classloader via a String (e.g., `Class.forName("MissingClass")`).
* **`NoClassDefFoundError`:** Implicit/Runtime failure. The class was present during compilation, but the JVM cannot find the `.jar` or `.class` file in the deployed server environment.

## 4. Exceptions to the Rule (Breaking Delegation) 🔓
* **Thread Context ClassLoader (TCCL):** Accessed via `Thread.currentThread().getContextClassLoader()`.
* **Interview Focus:** **JDBC API**. Allows core Bootstrap APIs to temporarily "borrow" the Application classloader to instantiate third-party database drivers, bypassing strict parent-first visibility limits.

## 5. Custom Classloaders 🧱
* **Mechanism:** Extending `java.lang.ClassLoader` to define custom loading logic.
* **Interview Focus:** **Web Servers (Tomcat)**. Used to provide **Isolation**. It allows multiple web applications on the same server to use different, conflicting versions of the same library (e.g., MySQL driver v5 vs. v8) without ambiguity.

## 6. Spring boot 

Let’s tackle this Spring Boot detour. It is a highly relevant, real-world application of the classloader concepts we just covered.

First, let's untangle a common point of confusion by separating **Build Time** from **Runtime**.

When you add an artifact name and version to your `pom.xml`, the downloading of that JAR from the Maven repository happens entirely at **Build Time**. Maven handles this step.

By the time you actually start your application (e.g., running `java -jar myapp.jar`), Maven's job is completely finished. The JVM and Spring Boot's classloaders only work with the files that are already packaged locally inside that single executable JAR.

This brings us to Spring Boot's real classloading magic: the **Fat JAR** (or Uber JAR).

If you were to unzip a built Spring Boot JAR, you wouldn't just see your compiled code. You would see a nested directory structure:



Inside a folder specifically called `BOOT-INF/lib/`, Spring Boot packages all of your third-party dependencies (like Tomcat, Hibernate, or your database drivers) as intact `.jar` files *inside* your main `.jar` file.

Here is where the JVM hits a roadblock: The standard **Application Classloader** knows how to load `.class` files from an unzipped folder or a standard `.jar`, but it has a strict limitation—it **cannot** read `.class` files from a `.jar` that is nested *inside* another `.jar`.

>Based on our previous discussion about how web servers handle special loading requirements, how do you think Spring Boot overrides this standard JVM limitation to read those nested JARs?

---

Standard Java looks at a nested `.jar` file and just sees a meaningless blob of compressed data. To fix this, Spring Boot doesn't map every single class name in a text file, but it does something very similar using the ZIP file format's own metadata.

Here is exactly how Spring Boot solves the Fat JAR problem:

1. **The Custom Classloader 🛠️:** Spring Boot uses its own custom classloader called the `LaunchedURLClassLoader`.
2. **Reading the Byte Offsets 📏:** Spring Boot rewrites Java's core `JarFile` class. When the application starts, Spring Boot reads the outer JAR's "Central Directory" (the ZIP metadata). It records the exact byte offsets (the start and end points) of every nested JAR inside.
3. **The Index File 📑:** You were absolutely right about a metadata file! Modern Spring Boot uses a `classpath.idx` file. Rather than listing every single class, this index lists the nested JARs and dictates the exact **order** in which the classloader should search them, making the lookup extremely fast and preventing version conflicts.

So, when your code asks for a class, the `LaunchedURLClassLoader` uses the index to know which nested JAR to check, and uses the byte offsets to read the compressed `.class` file directly from memory without ever needing to unzip the file to your hard drive.