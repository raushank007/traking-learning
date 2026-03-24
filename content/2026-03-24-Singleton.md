---
title: "Singleton"
date: "2026-03-24"
tags: ["LLD", "Design Pattern", "Creational"]
summary: "Create once use every where"
category: "LLD"
sessions:
  - date: "2026-03-24"
    startTime: "21:00"
    endTime: "21:21"
---


### The "When" and "Why" 🏗️

At its core, the **Singleton** pattern is designed to solve two problems simultaneously:
1.  **Strictly limits a class to exactly one instance.**
2.  **Provides a global access point to that single instance.**

**Why use it?**
In software systems, certain objects are heavily resource-intensive to create or need to coordinate actions across the entire application. If you have multiple instances of these objects floating around, you risk data inconsistency, resource exhaustion, or erratic system behavior.

**When to use it?**
You typically reach for a Singleton when dealing with:
* **Shared resources:** e.g., A database connection pool 🗄️ where opening and closing connections repeatedly would cripple performance.
* **Cross-cutting concerns:** e.g., A centralized logging system 📝 where all parts of the app write to the same file, or a configuration manager that reads a settings file exactly once at startup.
* **Hardware coordination:** e.g., A print spooler routing multiple application requests to a single physical printer 🖨️.



>Before we jump into the Java implementation, let's think about how we enforce this rule. If your goal is to absolutely guarantee that no other class in your application can use the `new` keyword to create an instance of your Singleton class, what is the very first thing you need to change about how a standard class is written?

Making the constructor `private` is the crucial first step. This completely shuts the door on any other class trying to use the `new` keyword to create an object.

Here is what our class looks like so far:

```java
public class Logger {
    // 1. Private constructor prevents instantiation from other classes
    private Logger() {
        // initialization code
    }
}
```

Now we have a class that no one can instantiate from the outside. This means the `Logger` class itself needs to be responsible for creating that single instance and holding onto it.

Since other classes cannot create an object to get the instance, they need a way to ask the *class itself* to give them the instance.

>What keyword in Java do we use for variables and methods so that they belong to the class level, rather than to a specific object instance?

The `private` modifier actually controls *visibility*—it ensures that variables and methods are hidden from other classes.

To make a variable or method belong to the class itself (meaning we don't need an object instance to use it), we use the **`static`** keyword.

Let's update our code by adding a `static` variable to hold our one and only instance, and a `static` method to serve as that global access point. We'll keep the variable `private` so other classes can't mess with it directly.

```java
public class Logger {
    // 2. Static variable to hold the single instance
    private static Logger instance;

    private Logger() {
        // initialization code
    }

    // 3. Static method to provide global access
    public static Logger getInstance() {
        // Logic goes here
        return instance;
    }
}
```

Now, other classes can call `Logger.getInstance()` to get the logger.

>Looking at the `getInstance()` method, what `if` condition do we need to write inside it to guarantee that we only ever execute `new Logger()` exactly one time?

We check if it's `null`. If it is, we create it. If it isn't, we just skip the creation step and return the one we already have. This concept is called **Lazy Initialization** because we delay creating the object until the exact moment someone actually needs it.

Here is what our complete, basic Singleton looks like:

```java
public class Logger {
    private static Logger instance;

    private Logger() {
        // initialization code
    }

    public static Logger getInstance() {
        if (instance == null) {
            instance = new Logger(); // Create it only if it doesn't exist
        }
        return instance;
    }
}
```

This code works perfectly for a simple, single-threaded application.

However, since you are preparing for an LLD interview, the interviewer will almost certainly throw a curveball here regarding **multi-threading** 🧵.

Imagine two different parts of your application running on two separate threads (Thread A and Thread B). They both call `Logger.getInstance()` at the exact same millisecond when the application first starts up.

>Looking at our `if (instance == null)` block, what problem could occur if both threads reach that line of code at the exact same time?

If both threads slip past that `if` check before either one has a chance to execute the `new Logger()` line, we end up with two separate objects. The pattern is completely broken. 💥

To fix this, we need a way to act like a traffic cop 🚦, forcing the threads to line up and take turns entering that critical section of code.

>In Java, what specific keyword do we use to lock a method or a block of code so that only one thread can execute it at a time?

The `synchronized` keyword acts as our lock 🔒.

If we add it to our method signature, it forces threads to take turns executing the entire method:

```java
public class Logger {
    private static Logger instance;

    private Logger() {}

    // 4. Add synchronized to make it thread-safe
    public static synchronized Logger getInstance() {
        if (instance == null) {
            instance = new Logger();
        }
        return instance;
    }
}
```

This perfectly solves our object creation problem. Thread A enters, locks the method, creates the object, and unlocks. Thread B waits its turn, enters, sees the object already exists, and just returns it.

However, interviewers love to poke holes in this specific implementation.

Think about the lifespan of your application. The `instance == null` condition is only true for the very first fraction of a second when the app starts. After that, the `Logger` is created, and every subsequent call just returns the existing instance.

>If 100 different threads are constantly trying to get the `Logger` to write messages throughout the day, what is the major performance downside of keeping that `synchronized` keyword on the entire `getInstance()` method?

Locking the entire method means every single thread has to wait in line just to read a variable, which kills performance ⏱️.

To solve this, we use a classic interview technique called **Double-Checked Locking**.

The strategy is to avoid locking the code unless the `instance` is actually `null`. We move the `synchronized` block *inside* an initial `if` statement.

Here is what that looks like as a starting point:

```java
public static Logger getInstance() {
    if (instance == null) { // First check (No lock, fast!)
        synchronized (Logger.class) { // Lock the class
            // ???
            instance = new Logger();
        }
    }
    return instance;
}
```

This is much faster, but we have a new logic puzzle.

Imagine Thread A and Thread B both evaluate that very first `if (instance == null)` line at the exact same millisecond. They both see `null`.

Thread A grabs the `synchronized` lock first, goes through the door 🚪, creates the `Logger`, and exits. Now Thread B, which was waiting right outside that `synchronized` door, gets the lock and steps inside.

>To stop Thread B from blindly executing `instance = new Logger();` and ruining our Singleton, what specific line of code do we need to add where the `// ???` is?

We check it a second time once we are safely inside the lock. This is exactly why this technique is famous as **Double-Checked Locking**.

Here is the updated code:

```java
public class Logger {
    private static Logger instance;

    private Logger() {}

    public static Logger getInstance() {
        if (instance == null) { // First check (No lock)
            synchronized (Logger.class) { 
                if (instance == null) { // Second check (Inside lock)
                    instance = new Logger();
                }
            }
        }
        return instance;
    }
}
```

Logically, this looks bulletproof 🛡️. Thread A and Thread B both see `null` at the first check. Thread A gets the lock, passes the second check, creates the object, and leaves. Thread B gets the lock, fails the second check (because Thread A just created it), and safely skips the creation step.

However, in a hardcore LLD interview, the interviewer will dig one level deeper into the **Java Memory Model**.

When the Java Virtual Machine (JVM) executes the line `instance = new Logger();`, it actually performs three distinct steps behind the scenes:
1.  **Allocate** memory space for the new object.
2.  **Initialize** the object (run the `Logger` constructor).
3.  **Assign** the memory address to our `instance` variable.

To optimize performance, compilers and CPUs are allowed to reorder these instructions as long as it doesn't change the outcome for the *current* thread. They might execute it in the order **1, 3, 2**.

Imagine Thread A executes Step 1 (Allocates memory) and Step 3 (Assigns the address to `instance`). At this exact microsecond, `instance` is no longer `null`, but the object hasn't been initialized yet (Step 2 is missing).

If Thread B comes along right then, it hits the very first `if (instance == null)`. Since `instance` has a memory address, Thread B thinks the object is ready, skips the lock entirely, grabs the half-baked object, and tries to use it. This will cause your application to crash 💥.

To fix this, we need to tell the JVM, "Do not reorder the instructions for this specific variable, and make sure any changes are immediately visible to all other threads."

>What specific keyword do we add to the `private static Logger instance;` declaration to enforce this rule?

Exactly. Adding the `volatile` keyword is the final piece of the puzzle 🧩.

It guarantees a "happens-before" relationship in the Java Memory Model. This ensures that the object is fully constructed in memory *before* its reference is assigned to the `instance` variable, preventing other threads from seeing a partially built object.

Here is your complete, production-ready, interview-passing Double-Checked Locking Singleton:

```java
public class Logger {
    // 1. volatile keyword ensures thread-safe initialization
    private static volatile Logger instance;

    // 2. Private constructor
    private Logger() {
        // initialization code
    }

    // 3. Global access point
    public static Logger getInstance() {
        if (instance == null) { // First check
            synchronized (Logger.class) { 
                if (instance == null) { // Second check
                    instance = new Logger();
                }
            }
        }
        return instance;
    }
}
```

---

In advanced LLD interviews, you will be asked how to break the Singleton pattern and how to defend against those attacks. 🛡️

### 1. The Reflection Attack
Java's Reflection API allows a user to inspect and change the behavior of classes at runtime. An attacker can use `Constructor.setAccessible(true)` to bypass your `private` constructor and force the creation of a new object.

**The Attack:**
```java
Constructor<Logger> constructor = Logger.class.getDeclaredConstructor();
constructor.setAccessible(true); // Bypasses the private modifier
Logger brokenInstance = constructor.newInstance();
```

**The Defense:**
Modify the private constructor to throw an exception if an instance already exists.
```java
private Logger() {
    if (instance != null) {
        throw new RuntimeException("Use getInstance() method to get the single instance of this class.");
    }
}
```

### 2. The Serialization Trap
If your Singleton implements `Serializable` (to be saved to a file or sent over a network), the process of deserializing it will bypass the constructor entirely and allocate memory for a brand-new instance.

**The Defense:**
Implement the `readResolve()` method. During deserialization, the JVM looks for this specific method. If it exists, the JVM uses the object returned by this method instead of the newly created deserialized object.

```java
import java.io.Serializable;

public class Logger implements Serializable {
    // ... standard singleton code ...

    // This method is called immediately after deserialization
    protected Object readResolve() {
        return getInstance(); 
    }
}
```

### 3. The Cloning Loophole
If your Singleton class inherits from a class that implements `Cloneable`, or implements it directly, a user can call the `clone()` method to create a duplicate object.

**The Defense:**
Override the `clone()` method and either throw an exception or simply return the existing instance.

```java
public class Logger implements Cloneable {
    // ... standard singleton code ...

    @Override
    protected Object clone() throws CloneNotSupportedException {
        // Option 1: Prevent cloning entirely
        throw new CloneNotSupportedException("Cloning of Singleton is not allowed");
        
        // Option 2: Return the same instance
        // return instance; 
    }
}
```

### The Ultimate Defense: Enums
Joshua Bloch (author of *Effective Java*) recommends using an `enum` to create a Singleton. It inherently protects against Reflection and Serialization attacks by default, managed entirely by the JVM.

```java
public enum LoggerEnum {
    INSTANCE;

    public void log(String message) {
        System.out.println(message);
    }
}
```
*Note: While Enums are the safest approach, interviewers still want to see you build the Double-Checked Locking version to prove you understand multi-threading and memory management.*