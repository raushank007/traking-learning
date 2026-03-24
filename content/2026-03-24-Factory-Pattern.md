---
title: "Factory Pattern and Factory Method"
date: "2026-03-24"
tags: ["LLD", "Design Pattern", "Creational"]
summary: "Delegate the object creation"
category: "LLD"
sessions:
  - date: "2026-03-24"
    startTime: "21:30"
    endTime: "21:56"
---


### The "When" and "Why" 🏭

At its core, Factory patterns deal with the problem of object creation. Specifically, they target the `new` keyword.

**Why use it?**
When you use `new Object()`, you are tightly coupling your code to a specific implementation. If the way that object is created changes, or if you want to swap it out for a different type of object based on certain conditions, you have to hunt down every place in your code that uses `new` and change it. Factories encapsulate this creation logic in one place.

**When to use it?**
* When a class cannot anticipate the type of objects it needs to create.
* When you want to localize the knowledge of which helper subclass is the delegate.
* When you want to decouple the client code from the concrete classes it needs to instantiate.



Let’s set up a scenario. Imagine we are building a logistics application. We have a common interface and a concrete class:

```java
public interface Transport {
    void deliver();
}

public class Truck implements Transport {
    @Override
    public void deliver() {
        System.out.println("Delivering by land in a box. 🚚");
    }
}
```

Now, imagine our main application logic (the client code) looks like this:

```java
public class LogisticsApp {
    public void planDelivery() {
        // Here is the hardcoded instantiation
        Transport transport = new Truck(); 
        transport.deliver();
    }
}
```

>If our application becomes successful and we now need to add sea deliveries using a `Ship` 🚢 class (which also implements `Transport`), what is the architectural problem with having `new Truck()` hardcoded directly inside the `planDelivery()` method?

If we write it out based on your suggestion, it looks like this:

```java
public class LogisticsApp {
    public void planDelivery(String transportType) {
        Transport transport = null;
        
        // Creation logic mixed with business logic
        if (transportType.equalsIgnoreCase("TRUCK")) {
            transport = new Truck();
        } else if (transportType.equalsIgnoreCase("SHIP")) {
            transport = new Ship();
        }

        if (transport != null) {
            transport.deliver();
        }
    }
}
```

This code absolutely works. But in an LLD interview, the interviewer will immediately point out that this violates two of the **SOLID** principles:

1.  **Single Responsibility Principle (SRP):** The `LogisticsApp` is now doing two entirely different jobs. It is handling the business logic of planning a delivery, AND it is acting as a manufacturing plant deciding how to build transport objects.
2.  **Open/Closed Principle (OCP):** Classes should be *open* for extension but *closed* for modification. If our business booms and we need to add a `Drone` 🚁 and a `Train` 🚆 next month, we are forced to open up the `LogisticsApp` core code and add more `else if` statements. Every time we touch core code, we risk breaking it.

To fix the SRP violation, we want to extract that entire `if-else` block and put it in its own dedicated class. We usually call this a **Simple Factory**.

```java
public class TransportFactory {
    // We move the if-else logic here
    public static Transport createTransport(String type) {
        if (type.equalsIgnoreCase("TRUCK")) {
            return new Truck();
        } else if (type.equalsIgnoreCase("SHIP")) {
            return new Ship();
        }
        throw new IllegalArgumentException("Unknown transport type");
    }
}
```

>Now that we have isolated the creation logic into the `TransportFactory`, how would you rewrite the code inside the `LogisticsApp`'s `planDelivery` method to use it?

Your `LogisticsApp` now looks like this:

```java
public class LogisticsApp {
    public void planDelivery(String type) {
        // The creation logic is fully delegated!
        Transport transport = TransportFactory.createTransport(type);
        
        if (transport != null) {
            transport.deliver();
        }
    }
}
```

This is a massive improvement. The `LogisticsApp` is no longer responsible for *how* a `Truck` or `Ship` is built. It just asks the factory for one and calls `.deliver()`. This perfectly satisfies the Single Responsibility Principle (SRP).

We have successfully built a **Simple Factory**.

However, let's look closely at the `TransportFactory` we just created:

```java
public class TransportFactory {
    public static Transport createTransport(String type) {
        if (type.equalsIgnoreCase("TRUCK")) {
            return new Truck();
        } else if (type.equalsIgnoreCase("SHIP")) {
            return new Ship();
        }
        // ...
    }
}
```

>If our company expands and buys a fleet of Drones 🚁 next month, what exact changes do we have to make to this `TransportFactory` class, and which SOLID principle does this still violate?

Every time we add a new vehicle, we are forced to open up the `TransportFactory.java` file and add another `else if`. This violates the **Open/Closed Principle** because the class is not *closed for modification*.

To fix this, we need to completely eliminate that giant `if-else` block. We do this by upgrading from a Simple Factory to the true **Factory Method Pattern**.

Instead of one massive factory that tries to build everything, the Factory Method pattern delegates the creation to subclasses. We define an abstract class (or interface) for creating an object, but we let the subclasses decide which exact class to instantiate.



Let's redesign our app. First, we create an abstract base class for our logistics operations.

```java
public abstract class Logistics {
    
    // This is the actual "Factory Method"
    public abstract Transport createTransport();

    // The core business logic remains here
    public void planDelivery() {
        // We call the factory method to get an object, 
        // without knowing exactly what class it is!
        Transport transport = createTransport();
        transport.deliver();
    }
}
```

Notice that `planDelivery()` no longer takes a `String type`, and it has no idea *what* kind of transport it's getting. It just knows it will get *something* that implements the `Transport` interface.

>Now, to make this actually work for our land deliveries, what specific new class do we need to create that extends `Logistics`, and what exactly will its `createTransport()` method return?

Here is the implementation for the truck delivery subclass. We override the factory method to return the specific transport vehicle:

```java
public class TruckDelivery extends Logistics {
    @Override
    public Transport createTransport() {
        return new Truck(); // Instantiates the specific product
    }
}
```

Similarly, if we want to add sea deliveries, we create another subclass:

```java
public class ShipDelivery extends Logistics {
    @Override
    public Transport createTransport() {
        return new Ship(); 
    }
}
```

By structuring it this way, we've successfully deferred the `new` keyword to the subclasses.

This completely solves our Open/Closed Principle problem. If our company buys a fleet of Drones 🚁 tomorrow, we don't have to open up or modify `Logistics`, `TruckDelivery`, or `ShipDelivery`. We simply create a brand new `DroneDelivery` class that extends `Logistics`. The core system remains entirely closed to modification but open to extension.

Now, let's look at how the client actually interacts with this system. Imagine you are writing the `main` method for your application and you want to execute a sea delivery.

>How would you write the code to instantiate the correct logistics creator and trigger the `planDelivery()` process?

Here is the implementation for the truck delivery subclass. We override the factory method to return the specific transport vehicle:

```java
public class TruckDelivery extends Logistics {
    @Override
    public Transport createTransport() {
        return new Truck(); // Instantiates the specific product
    }
}
```

Similarly, if we want to add sea deliveries, we create another subclass:

```java
public class ShipDelivery extends Logistics {
    @Override
    public Transport createTransport() {
        return new Ship(); 
    }
}
```

By structuring it this way, we've successfully deferred the `new` keyword to the subclasses.

This completely solves our Open/Closed Principle problem. If our company buys a fleet of Drones 🚁 tomorrow, we don't have to open up or modify `Logistics`, `TruckDelivery`, or `ShipDelivery`. We simply create a brand new `DroneDelivery` class that extends `Logistics`. The core system remains entirely closed to modification but open to extension.

Now, let's look at how the client actually interacts with this system. Imagine you are writing the `main` method for your application and you want to execute a sea delivery.

>How would you write the code to instantiate the correct logistics creator and trigger the `planDelivery()` process?

You are exactly right on the structure! We built that `ShipDelivery` (or `SeaDelivery`) class to extend the abstract `Logistics` class.

But I want to show you the real magic of this pattern: **how the client actually uses it.**

Imagine you are writing the `main` method. Here is how you trigger that sea delivery:

```java
public class MainApp {
    public static void main(String[] args) {
        // 1. We instantiate the specific creator we want
        Logistics logistics = new ShipDelivery();
        
        // 2. We execute the core business logic. 
        // The factory method inside handles creating the 'Ship' behind the scenes!
        logistics.planDelivery();
    }
}
```
>How would you write the code to instantiate the correct logistics creator and trigger the planDelivery() process?

Notice what is *missing* here. The `MainApp` has absolutely no idea that a `Ship` class even exists. It only knows about `Logistics` and `ShipDelivery`. If the internal implementation of how a `Ship` is built changes (maybe it needs a captain and fuel parameters now), the `MainApp` doesn't change at all. That is the power of decoupling!

***

# LLD Interview Prep: Factory Patterns

## Part 1: The "When" and "Why" 🏭

The **Factory Patterns** deal with the problem of object creation, specifically hiding the exact class of the object that will be created from the client code.

**Why use it?**
Using the `new` keyword tightly couples your code to a specific implementation. Factories encapsulate creation logic, making your system modular, testable, and adaptable to change.

**When to use it?**
* When a class cannot anticipate the exact type of objects it needs to create.
* When you want to localize the complex logic of object instantiation.
* To adhere to the **Single Responsibility Principle (SRP)** by separating object creation from business logic.
* To adhere to the **Open/Closed Principle (OCP)** by allowing new types to be introduced without breaking existing code.

---

## Part 2: Building the Factory

### 1. The Simple Factory (The Anti-Pattern / Stepping Stone)
Often confused with the actual design pattern, a Simple Factory is just a class with a large `if-else` or `switch` statement.

**The Flaw:** It violates the Open/Closed Principle. Every time you add a new product (e.g., `Drone`), you must modify the Factory class.

```java
// Product Interface & Implementations
public interface Transport { void deliver(); }
public class Truck implements Transport { public void deliver() { System.out.println("Land delivery"); } }
public class Ship implements Transport { public void deliver() { System.out.println("Sea delivery"); } }

// The Simple Factory
public class TransportFactory {
    public static Transport createTransport(String type) {
        if (type.equalsIgnoreCase("TRUCK")) return new Truck();
        if (type.equalsIgnoreCase("SHIP")) return new Ship();
        throw new IllegalArgumentException("Unknown type");
    }
}
```

### 2. The Factory Method Pattern (The True Pattern)
This pattern defines an interface/abstract class for creating an object, but lets subclasses decide which class to instantiate. It defers instantiation to subclasses.

```java
// 1. The Creator (Abstract)
public abstract class Logistics {
    // The Factory Method
    public abstract Transport createTransport();

    // Core Business Logic
    public void planDelivery() {
        Transport transport = createTransport();
        transport.deliver();
    }
}

// 2. Concrete Creators
public class TruckDelivery extends Logistics {
    @Override
    public Transport createTransport() {
        return new Truck(); 
    }
}

public class ShipDelivery extends Logistics {
    @Override
    public Transport createTransport() {
        return new Ship(); 
    }
}
```

---

## Part 3: Factory Interview Pitfalls & Deep Dives 🕳️

Interviewers will test if you actually understand the architecture, or if you just memorized the code. Here is how to defend your knowledge.

### 1. The "Class Explosion" Trap
**The Interviewer asks:** *"If we use the Factory Method, we have to create a new Creator subclass (`DroneDelivery`, `TrainDelivery`) for every new Product. Doesn't this lead to way too many classes?"*

**Your Defense:** Acknowledge the trade-off. Yes, the Factory Method can lead to a parallel class hierarchy (one creator for every product).
* **Solution A:** If the creation logic is very simple, argue that a **Simple Factory** or a **Parameterized Factory Method** (passing an enum/string to the factory method) might be more pragmatic, even if it slightly bends strict OCP. Engineering is about trade-offs.
* **Solution B:** Mention that if we are creating *families* of related objects (e.g., a Sea Delivery needs a Ship *and* a Dock *and* a Crane), we should upgrade to the **Abstract Factory** pattern.

### 2. The Dependency Injection (DI) Curveball
**The Interviewer asks:** *"In modern Java development (like Spring Boot), we rarely write Factories like this. We just use `@Autowired`. Is the Factory pattern dead?"*

**Your Defense:**
No, it's not dead; it's just been abstracted away! Dependency Injection frameworks (like Spring's IoC container) *are* essentially giant, highly advanced factories. Under the hood, Spring uses Factory patterns (specifically `BeanFactory`) to instantiate and manage the lifecycle of your objects. Understanding the manual Factory pattern is essential to understanding how DI frameworks operate.

### 3. Static vs. Non-Static Factories
**The Interviewer asks:** *"In the Simple Factory, the creation method is usually `static`. In the Factory Method pattern, it's not. Why?"*

**Your Defense:**
A `static` method cannot be overridden by subclasses. The entire premise of the true Factory Method pattern relies on polymorphism—letting the subclasses override the `createTransport()` method to provide specific implementations. If you make it `static`, you completely break the pattern.
