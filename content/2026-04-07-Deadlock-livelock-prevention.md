---
title: "Deadlock, prevention & Livelock"
date: "2026-04-07"
tags: [ "Java","Concurrency","Multithreading"]
summary: ""
category: "java"
sessions:
  - date: "2026-04-07"
    startTime: "16:26"
    endTime: "15:00"
---

## DEADLOCK

**What is a Deadlock?**
A deadlock occurs when two or more threads permanently block each other because each is holding a resource and waiting for another.

**The 4 Deadlock Conditions**
Deadlock can happen ony if all four exist:
1. Mutual exclusion - resource cannot be shared
2. Hold and wait - thread holds one resource and waits for another
3. No preemption - resources can't be forcibly taken
4. Circular wait - circular dependency between threads

**SCENARIO: Simple Deadlock**

> Two threads need two locks(lockA, lockB).
> Each thread acquires them in a different order
> Explain how deadlock happens 

Code that causes Deadlock
```java
class DeadlockExample {
    private static final Object lockA = new Object();
    private static final Object lockB = new Object();
    
    public static void main(String[] args){
        Thread t1 = new Thread(()->{
            synchronized (lockA){
                sleep();
                synchronized (lockB){
                    System.out.println("thread 1 acquired both locks");
                }
            }
        });
        
       Thread t2 = new Thread(()->{
          synchronized (lockB){
              sleep();
              synchronized (lockA){
                  System.out.prinltn("Thread 2 acquired booth locks");
              }
          }
       });
       
       t1.start();
       t2.start();
    }
    
    static void sleep(){
        try{
            Thread.sleep(100);
        }catch (InterruptedException ignored){}
    }
}
```

| Step | Thread-1      | Thread-2      |
|------|---------------|---------------|
| 1    | locks A       | --            |
| 2    | --            | locks B       |
| 3    | waits for B   | waits for A   |
| 4    | stuck forever | stuck forever |

>Circular wait -> deadlock

## how to Detect Deadlock
1. Using jstack
```text
jstack <pid>
```
Output:
```text
Found 1 deadlock
Thread-1 waiting for lockB
Thread-2 waiting for lockA
```
**Using Java Code**
```text
ThreadMXBean bean = ManagementFactory.getThreadMXBean();
long[] threadIds = bean.findDeadlockedThreads();
```

**Deadlock Prevention Techniques**
>All threads must acquire locks in the same global order.

**Locking Ordering**

```text
synchroized(lockA){
    synchronized(lockB){
        //safe
    }
}
```
>Circular wait eliminated
> Most recommended solution

**Try-Lock(Timeouts)**

```java
if(lock1.tryLock(100, TimeUnit.MILLISECONDS)){
    try{
        if(lock2.tryLock(100, TimeUnit.MILLISECONDS))  {
            try{
                //work
            }finally{
                lock2.unlock();    
            }
        }  
    }finally{
        lock1.unlock();
    }    
}
```
