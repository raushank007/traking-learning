---
title: "Abstract Factory"
date: "2026-03-25"
tags: ["LLD", "Design Pattern", "Creational"]
summary: "Delegate the object creation and decouple with business logic"
category: "LLD"
sessions:
  - date: "2026-03-25"
    startTime: "13:15"
    endTime: "13:48"
---

# Abstract Factory Design Pattern

## 1. Core Concept
The **Abstract Factory** is a creational design pattern that lets you produce **families of related or dependent objects** without specifying their concrete classes. 

While the standard Factory Method creates one specific type of object, the Abstract Factory adds another layer of abstraction to ensure that multiple related objects are created together and are guaranteed to be compatible.

## 2. The Real-World Scenario: Delivery System
Imagine a logistics company with different delivery modes. Each mode requires a specific family of objects that must work together:
* **Air Delivery Family:** `Drone` (Transport) + `LightweightBag` (Packaging) + `AerialSensor` (Routing)
* **Road Delivery Family:** `Truck` (Transport) + `StandardBox` (Packaging) + `GPS` (Routing)

Mixing a `Drone` with a `StandardBox` would be incompatible. The Abstract Factory prevents this by grouping their creation.

## 3. Implementation in Java

### Step 1: The Abstract Factory Interface
Create an overarching interface that declares methods for creating *every* object in the family.

```java
public interface DeliveryFactory {
    Transport createTransport();
    Packaging createPackaging();
    RoutingSystem createRoutingSystem();
}
```

### Step 2: The Concrete Factory
Implement the interface for a specific family. This class is responsible for instantiating the correct concrete objects for that specific mode.

```java
public class AirDeliveryFactory implements DeliveryFactory {
    
    @Override
    public Transport createTransport() {
        return new Drone(); 
    }

    @Override
    public Packaging createPackaging() {
        return new LightweightBag();
    }

    @Override
    public RoutingSystem createRoutingSystem() {
        return new AerialSensor();
    }
}
```

### Step 3: The Client Code (Core Logic)
The main business logic receives a factory interface and uses it to get the objects it needs. It is entirely unaware of the concrete classes being created.

```java
public void processDelivery(DeliveryFactory factory) {
    // 1. Get the compatible objects from the provided factory
    Transport transport = factory.createTransport();
    Packaging packaging = factory.createPackaging();

    // 2. Execute business logic
    System.out.println("Packing the item...");
    System.out.println("Starting delivery...");
}
```

## 4. Key Architectural Benefits

* **Separation of Concerns / Decoupling:** The complex logic of object creation is completely isolated from the core business processing logic. The client code doesn't care *how* the objects are built, just *how* to use them.
* **Guaranteed Compatibility:** By forcing the use of a specific concrete factory (like `AirDeliveryFactory`), you eliminate the risk of developers accidentally mixing incompatible objects (e.g., using a `LightweightBag` on a `Ship`).
* **Open/Closed Principle:** The code is open for extension but closed for modification. If the company adds a "Space Delivery" family next year, you only need to create a `SpaceDeliveryFactory`. **Zero lines of code need to change inside the `processDelivery` method.**
