---
title: "Wait/Notify vs Condition Variables"
date: "2026-04-01"
tags: [ "Java","Concurrency","Multithreading"]
summary: ""
category: "java"
sessions:
  - date: "2026-04-01"
    startTime: "21:30"
    endTime: "21:53"
---

## Questions 

1. What is wait() used for ?

wait() is used to pause a thread when a condition is not met.
The thread releases the lock and enters the waiting state.

2. What is notify() used for ?

notify() wakes one random thread waiting on the object's monitor.
We cannot control which waiting thread gets waken up.

3. Why is notify() problematic in multi-condition scenarios?

Because notify() wakes a random waiting thread, not the correct one.
If the wrong thread wakes, it checks the condition, finds it false, and goes back to waiting -> waste of CPU

**Example**
Producer and Consumer both waiting on the same monitor.
Queue become non-empty -> ideally should wake Consumer only.
But notify() might wake the Producer, which is useless.

4. Why do some systems use notifyAll() instead?

To avoid waking the wrong thread.
But notifyAll() wakes all waiting threads - even those not needing the wakeup.

This causes the **Thundering Herd Problem:**
- All threads wake
- Fight for the lock
- Most find the condition still false
- Go back to sleep
- Massive CPU waste

5. Why were Condition Variables introduced in Java ?

To solve the limitations of wait/notify by giving precise control over which threads wait and which thread wake up.

With condition variables, we can create multiple waiting queues for the same lock.

6. What does a Condition represent?

A Specific waiting condition.
```java
Condition notEmpty = lock.newCondition();
Condition notFull = lock.newCondition();
```

Each condition has its own waiting queue.

7. Why are Condition variables more maintainable than wait/notify?

- Each condition expresses clear intention
- Producers & Consumers don't get mixed
- Easy to debug wrong wakeups 
- Better performance (no random or mass wakeups)


| Feature       | wait/notify               | Condition Variables |
|---------------|---------------------------|---------------------|
| Wait queues   | Only one                  | Multiple queues     |
| Wake control  | Random thread             | Specific condition  |
| Efficiency    | May need notifyAll->waste | Very efficient      |
| Code clarity  | Low                       | High                |
| Debuggability | Hard                      | Easy                |
