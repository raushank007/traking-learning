---
title: "JVM Architecture(Execution Engine,JIT compiler,Native Interfaces)"
date: "2026-04-14"
tags: [ "Java","JVM Internals","Memory Management"]
summary: ""
category: "java"
sessions:
  - date: "2026-04-11"
    startTime: "07:30"
    endTime: "07:48"
---

1. JVM Architecture 

![JVM Architecture(Execution engine,JIT compiler and Native)](./public/jvm.svg)

2. Compilation stages

**javac - Compile Time**
```text
.java -> .class(bytecode)
```
>javac compiles java source code into platform-independent bytecode for portability.
>Bytecode is not CPU-specific, JVM executes bytecode, it doesn't generate it

**JIT Compiler**
```text
Bytecode -> Native machine code
```
>JIT compiles frequently executed bytecode into optimized native machine code at runtime.

3. JVM Execution Engine


