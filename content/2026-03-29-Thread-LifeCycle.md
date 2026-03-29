---
title: "Thread LifeCycle and OS Level context switching"
date: "2026-03-29"
tags: [ "Java","Concurrency","Multithreading"]
summary: "JVM vs. OS Threads, Context Switching Overhead, Blocking I/O, and Java 21 Virtual Threads."
category: "java"
sessions:
  - date: "2026-03-29"
    startTime: "11:30"
    endTime: "12:02"
---




## Phase 1: Baseline & Assessment

**Coach:** What specific topic, algorithm, or system design concept would you like to master today for your SDE 3 interview?
**Candidate:** Thread Lifecycle and OS level context switching

**Coach:** What do you already know about the thread lifecycle and context switching, and what specific areas usually trip you up?
**Candidate:** Threads have different lifecycle. `start`: when we use `thread.start()`, then it will come in running process. Then when we `wait()` or `sleep()` it will go into paused status. Then we get to destroy state. When CPU switch the operations from one thread to another thread -> this is call context switching.

---

## Phase 2: The OS Bottleneck & The ExecutorService Trap

**Coach:** You described the high-level JVM view perfectly: `NEW` -> `RUNNABLE` -> `WAITING`/`TIMED_WAITING`/`BLOCKED` -> `TERMINATED`. But at the SDE 3 level, we must look underneath the hood at the OS kernel. 

**The Kitchen Analogy:**
Imagine a highly skilled Chef (the CPU core) working on multiple recipes (Threads).
* **Runnable:** Ingredients prepped, waiting for the Chef.
* **Running:** Chef is actively chopping onions (Recipe A).
* **Blocked/Waiting:** Recipe A is baking in the oven (I/O operation) or waiting for a shared blender (Lock). 

**Context Switching Overhead:**
When the Chef switches from Recipe A to Recipe B, they must wipe their hands, write down exactly where they stopped, walk over, read Recipe B's state, and pick up the spoon. That transition time where *zero actual cooking is getting done* is your Context Switch Overhead. 

In pre-Java 21, every `new Thread().start()` makes a native JNI call to allocate a heavy, 1:1 OS-level kernel thread. 

```java
// Junior Engineer's Web Server
public class WebServer {
    public void handleRequests(ServerSocket serverSocket) throws IOException {
        while (true) {
            Socket socket = serverSocket.accept();
            // Spinning up a brand new heavy OS thread for every request
            new Thread(() -> processRequest(socket)).start(); 
        }
    }
    private void processRequest(Socket socket) { /* read, query DB, write */ }
}
```

**Questions to the Candidate:**
1. If we suddenly get a spike of 10,000 concurrent requests on an 8-core machine, what happens at the OS level? Explain the trade-off between Latency and Throughput.
2. At the hardware/OS level, what actually is the "state" being saved and loaded during a context switch?
3. How would you redesign this Java code to achieve high throughput without choking the OS?

**Candidate:** If suddenly spike of 10000 concurrent requests, we have 1:1 mapping of no of thread will create how many number of core available, rest need to wait in the queue. Latency will increase and the context switch among 10000 active thread, it will use too much CPU processing. CPU need to remember the state of the previous thread to resume it, to store these many metadata of thread memory will also utilize. Maybe can use `ExecutorService`.

---

## Phase 3: Hardware Realities & Blocking I/O

**Coach:**
Correct instincts—Latency spikes, CPU thrashing, and Memory bloat are the enemies here.

**SDE 3 Correction:** A Java `Thread` has a 1:1 mapping with an *OS Kernel Thread*, not the CPU cores. The OS will happily create 10,000 threads for 8 physical cores, causing massive **Thrashing** (CPU spends more time switching than executing).

**The State (Thread Control Block):**
When paused, the OS saves:
1.  **Program Counter (PC):** The exact line of memory where code stopped.
2.  **CPU Registers:** Localized CPU calculation data.
3.  **Stack Pointer:** Each OS thread gets a 1MB call stack. 10,000 threads = 10GB of RAM wasted on empty stack frames.

**The ExecutorService Redesign:**
```java
public class BetterWebServer {
    // Cap OS threads at 200 to prevent CPU thrashing and memory exhaustion.
    private final ExecutorService threadPool = Executors.newFixedThreadPool(200);

    public void handleRequests(ServerSocket serverSocket) throws IOException {
        while (true) {
            Socket socket = serverSocket.accept();
            threadPool.submit(() -> processRequest(socket)); 
        }
    }
    private void processRequest(Socket socket) {
        database.query("SELECT * FROM users"); // 100ms Blocking I/O call
    }
}
```

**Question to the Candidate:**
We fixed the OS thrashing by capping threads at 200. But if `processRequest` makes a 100ms Database call, all 200 threads get stuck waiting for the network. The remaining 9,800 requests sit in the queue. How do modern frameworks or Java 21's Virtual Threads solve this specific "blocking I/O" problem without breaking the 1:1 OS thread bottleneck?

**Candidate:**
Java 21's virtual thread, I am not aware of it.

---

## Phase 4: Java 21 Virtual Threads & Downstream Protection

**Coach:**
Let's introduce Virtual Threads (Project Loom/Java 21).

**The Smart Chef Analogy:**
When the Chef puts a cake in the oven (Database I/O call), they don't stand and wait. They take the Recipe Ticket (Virtual Thread), clip it to a board, and instantly grab the next ticket. When the oven "dings", the ticket goes back into the queue.

**M:N Scheduling:**
* **Platform (Carrier) Threads:** Heavy 1MB OS threads (pooled, equal to CPU cores).
* **Virtual Threads:** Lightweight, user-mode threads (taking just bytes of Heap memory).
  When a Virtual Thread hits a blocking operation (`socket.read()`), the JVM dynamically **"unmounts"** it, saving its state to the Heap, and instantly frees the Platform Thread to run another Virtual Thread.

```java
public class ModernWebServer {
    public void handleRequests(ServerSocket serverSocket) throws IOException {
        // Massive try-with-resources. Creates a new Virtual Thread for EVERY task.
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            while (true) {
                Socket socket = serverSocket.accept();
                executor.submit(() -> processRequest(socket)); 
            }
        }
    }
    private void processRequest(Socket socket) {
        database.query("SELECT * FROM users"); // JVM safely unmounts here!
    }
}
```

**The Final SDE 3 Edge Case Question:**
You rewrite a legacy backend to use Java 21 Virtual Threads. It easily accepts 100,000 concurrent network requests without OS thrashing. However, 30 seconds later, the system crashes. What critical downstream system did your 100,000 virtual threads accidentally destroy, and how do you prevent this?

**Candidate:**
Maybe we need to increase the connection pool of the database -> suppose lots of db call.

**Coach:**
Spot on! The bottleneck shifted to the **Database Connection Pool**.

You cannot simply increase the pool to 100,000 because a DB connection is a heavy, physical TCP network socket. 100,000 TCP connections will crash the database CPU.

**The SDE 3 Solution:** Implement **Bulkheading** or Concurrency Limiting (e.g., using a `Semaphore`). You allow 100,000 Virtual Threads to accept web requests, but strictly limit them so only, say, 100 can talk to the DB concurrently. The other 99,900 wait cheaply in JVM memory without hurting the web server's OS or crashing the downstream database.
