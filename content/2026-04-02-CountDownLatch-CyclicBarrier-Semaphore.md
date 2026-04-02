---
title: "CountDownLatch vs CyclicBarrier vs Semaphore"
date: "2026-04-02"
tags: [ "Java","Concurrency","Multithreading"]
summary: ""
category: "java"
sessions:
  - date: "2026-04-02"
    startTime: "21:05"
    endTime: "21:26"
---

## CountDownLatch

**Think about the name**

`count` - `Down` - `Latch` 

**Example**
- we fire 5 api calls in parallel(5 threads).
- We want to wait until all of them return 200 OK.
- Then a "final thread" aggregates the responses.

**Why it fits**
- Count stats at 5
- Every worker thread cals countdown() when done
- Final thread calls `await()` and blocks until count reaches 0
- Once the count hits zero -> latch opens -> final thread proceeds

> CountDownLatch = a door that opens only after N workers finish their tasks. Once opened, it will NEVER close again.

```java
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;

public class ApiAggregator {
    public static void main(String[] args) throws InterruptedException {
        ExecutorService executor = ExecutorService.newFixedThreadPool(15);
        CountDownLatch latch = new CountDownLatch(5);

        ConcurrentHashMap<String,String> responses = new ConcurrentHashMap<>();
        
        for(int i=1;i<=5;i++){
            int serviceId =i;
            executor.submit(()->{
                try{
                    String resp = callService(serviceId);
                    responses.put("service-"+serviceId,resp);
                }finally {
                    latch.countDown();
                }
            });
        }
        latch.await();
        executor.shutdown();
        
        System.out.println("All services responded:");
        System.out.println(responses);
    }
}
```

## CyclicBarrier

Imagine we have a scheduled job that works in multiple steps, and in each step, all worker threads must finish before any thread proceeds to the next step.

For example:

A corn job runs every night and does this in 3 phases:
- Phase 1 : Read data in parallel using 5 threads
- Barrier -> All must finish before Phase 2 starts 
- Phase 2 : Transform data in parallel
- Barrier -> All must finish before Phase 3 starts
- Phase 3: Upload processed data 

Every phase repeats daily, so the "barrier" must be reusable.
This is exactly what **CyclicBarrier** is designed for.

>CyclicBarrier makes a group of threads wait for each other at a common checkpoint. When all threads reach the barrier, they all proceed together, and the barrier automatically resets for the next round.

```java
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.ExecutorService;

public class MultiPhaseProcessor {
    public static void main(String[] args) {
        int numberOfWorkers = 3;

        CyclicBarrier barrier = new CyclicBarrier(numberOfWorkers, () -> {
            System.out.println("All workers finished this phase, Moving to next....");
        });

        ExecutorService executor = ExecutorService.newFixedThreadPool(numberOfWorkers);

        for (int i = 1; i <= numberOfWorkers; i++) {
            executor.submit(new Worker(i, barrier));
        }

        executor.shutdown();
    }
}

class Worker implements Runnable {
    private final int id;
    private final CyclicBarrier barrier;

    Worker(int id, CyclicBarrier barrier) {
        this.id = id;
        this.barrier = barrier;
    }

    @Override
    public void run() {
        try {
            doWork("Reading");
            barrier.await();
            
            doWork("Transforming");
            barrier.await();
            
            doWork("Uploading");
            barrier.await();
            
        }catch (Exception e){
            e.printStackTrace();
        }
    }
    
    private void doWork(string phase) throws InterruptedException{
        System.out.println("Worker "+id+"->"+phase);
        Thread.sleep(800);
    }
}
```

## Semaphore

Imaging a parking lot with 3 parking spots 
- Only 3 cars can be inside at any time
- When a car leaves, a spot frees up and another car can enter

This is exactly what Semaphore does.

A Semaphore controls how many threads can access a resource at once.

>A Semaphore controls how many threads can access a particular section of code at same time.It uses permits to limit concirrency to N threads.

**Example**
External API allows max 3 concurrent calls

We might have:
- 50 worker Threads
- Only 3 should call the API at a time

```java
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Semaphore;

public class ApiRateLimiter {
    private static final Semaphore semaphore = new Semaphore(3);

    public static void main(String[] args) throws InterruptedException {
        ExecutorService executor = Executors.newFixedThreadPool(10);
        
        for(int i=1;i<=10;i++){
            int taskId =i;
            executor.submit(()->callApi(taskId));
        }
        executor.shutdown();
    }
    
    static void callApi(int id){
        try{
            semaphore.acquire();
            System.out.println("API call "+ id +" started ...");
            Thread.sleep(1500);
            System.out.println("API call" + id + " finished.");
        }catch (Exception ignored){
            
        }finally {
            semaphore.release();
        }
    }
}
```

| Tool           | Real-World Problem                    | Key Behaviour                    |
|----------------|---------------------------------------|----------------------------------|
| CountDownLatch | Wait for N threads/services to finish | One-time gate                    |
| CyclicBarrier  | Sync threads after every phase        | Resuable meeting point           |
| Semaphore      | Limit resouce access                  | Permit-based concurrency control |

