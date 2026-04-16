---
title: "ThreadLocals and memory leaks"
date: "2026-04-07"
tags: [ "Java","Concurrency","Multithreading"]
summary: ""
category: "java"
sessions:
- date: "2026-04-07"
  startTime: "15:30"
  endTime: "15:55"
---

## ThreadLocal
ThreadLocal provides thread-confined storage-each thread gets its own independent value,even when using the same variable reference.

>ThreadLocal does not store data.
> The Thread stores the data.

Internally:
```text
Thread
    |__ ThreadLocalMap
        |__ ThreadLocal -> value
        |__ ThreadLocal -> value
```

```java
ThreadLocal<String> userId = new ThreadLocal<>();

userId.set("user-123");
System.out.println(userId.get()); // user-123
```

Each thread sees its own value.

### Why Do we need threadLocal?

**Problem Without ThreadLocal**
- Shared variables across threads
- Race conditions
- Context contamination(wrong user, wrong request)

**What ThreadLocal Solves**
- Removes need for synchronization
- Avoids passing context through deep call chains
- Keeps per-thread context isolated

### Common ThreadLocal Use Case
1. Request/Correlation Id
2. Logging context(MDC)
3. Security context(current user)
4. Transaction context
5. Locale / Timezone
6. Profiling/metrics

```java
public class RequestContext{
    private static final  ThreadLocal<String> REQUEST_ID = new ThreadLocal<>();
    
    public static void set(String id){
        REQUEST_ID.set(id);
    }
    public static String set(String get){
        return REQUEST_ID.get();
    }
    public static void clear(){
        REQUEST_ID.remove();
    }
}

//usage

try{
    RequestContext.set("REQ-101");
    service.process();
}finally{
    RequestContext.clear();
}
```

### ThreadLocal + Thread Pools = MEMORY LEAK RISK
**What Goes Wrong?**
- Thread pools resuse threads
- ThreadLocal value stays attached to the thread
- Next request uses stale data

**Example Problem**
```text
Request A -> Thread-1 -> userId = Alice
Request ends (ThreadLocal Not removed)

Request B -> Thread-1 reused -> userId still Alice
```

**Why GC Does NOT Clean It**
Because: `Thread` -> `ThreadLocalMap` -> `value`

- Thread is alive
- String reference exists
- GC cannot reclaim memory

## Golden Rule
>if you call set(), you must call remove() , Always use try-finally.

### Why Short-Lived Threads Were Safe
**Short-Lived Threads:**
- Created -> run -> die
- Thread and its ThreadLocalMap get GC-ed
- No resue
- No leak

**Thread Pools:**
- Threads live long
- Resused across tasks
- Leaks if ThreadLocal not cleaned

---

### what are virtual threads?

Purpose
- Expensive thread creation
- OS thread blocking 
- Thread pool sizing complexity

**Virtual threads  are:**
> Virtual threads are lightweight JVM-managed threads that decoupled java's concurrency model from OS threads, allowing millions of concurrent blocking tasks with minimal memory and context-switching overhead.

```java
Thread.startVirtualThread(()->{
    task();
});

//Or via executor
ExecutorService executor = Executors.newVirtualThreadPer;
```



