---
title: "Inheritance"
date: "2026-03-12"
tags: ["OOPs", "LLD"]
summary: "Inheritance is and OOP mechanism where one(child/derived) acquires the properties (fields) and behaviours (methods) of another class (parent/base)."
category: "LLD"
sessions:
  - date: "2026-03-12"
    startTime: "17:24"
    endTime: "17:59"
---

# Inheritance

Inheritance is the mechanism where one class (the child/subclass) acquires the properties and behaviors (fields and methods) of another class (the parent/superclass). It represents an **IS-A** relationship (e.g., a `Car` IS-A `Vehicle`).

**The Key Mechanics**

- **The `extends` Keyword**: This establishes the inheritance link. A class can only extend one other class directly.

- **The Universal Parent**: If a class does not explicitly extend anything, it implicitly extends `java.lang.Object`. Therefore, every class in Java inherits methods like `toString()`, `equals()`, and `hashCode()`.

- **What is Inherited?** The subclass inherits all `public` and `protected` members. It does not inherit `private` members. `default` (package-private) members are only inherited if the subclass is in the same package.

- **Constructors are NOT Inherited**: A subclass does not inherit the parent's constructors, but it must invoke one (either implicitly or explicitly).

**The `super` Keyword uses**

1. **Accessing Parent Members**: If a child class shadows a parent's variable or overrides a method, `super` allows us to bypass the child's version and access the parent's version.
2. **Calling Parents Constructor**: `super()` is used to invoke the parent class's constructor. It must be the very first statement inside the child's constructor. If we don't write it, the Java compiler automatically inserts a hidden super(); call to the parent's no-argument constructor.

**Basic Structure**
```java
class Employee {
    protected String name;
    
    public Employee(String name) {
        this.name = name;
    }
    
    public void displayRole() {
        System.out.println("I am a generic employee.");
    }
}

class SoftwareEngineer extends Employee {
    private String primaryLanguage;

    public SoftwareEngineer(String name, String primaryLanguage) {
        // Must be the first line! Calls the Employee constructor.
        super(name); 
        this.primaryLanguage = primaryLanguage;
    }

    @Override
    public void displayRole() {
        // Re-using parent logic, then adding child logic
        super.displayRole(); 
        System.out.println("I write code in " + primaryLanguage);
    }
}
```
>If the parent class `Employee` only has a parameterized constructor (like above) and no default no-argument constructor, the compiler will not automatically insert super(). You must explicitly call super(name) in the child class, otherwise, the code will not compile.

### **Topic 2: Types of Inheritance & The Diamond Problem**

In Object-Oriented Programming, inheritance can take several architectural forms. Understanding which forms Java supports natively through classes, which it restricts, and *why*, is a highly tested interview area.

#### **Supported Types of Inheritance (Via Classes)**

1. **Single Inheritance:** Class B extends Class A.
2. **Multilevel Inheritance:** Class C extends Class B, which extends Class A. (A -> B -> C).
3. **Hierarchical Inheritance:** Class B and Class C both extend Class A.

#### **Unsupported Types of Inheritance (Via Classes)**

Java completely forbids a class from extending more than one class. This means it does not support:

1. **Multiple Inheritance:** Class C extends both Class A and Class B.
2. **Hybrid Inheritance:** A mix of hierarchical and multiple inheritance (this directly leads to the Diamond Problem).

#### **The Diamond Problem Explained**

Interviewers will frequently ask you to explain why Java prevents multiple class inheritance. The answer is ambiguity, illustrated by the "Diamond Problem."

Imagine this scenario if Java *did* allow multiple inheritance:

1. Class `Device` has a method `start()`.
2. Class `Printer` extends `Device` and overrides `start()` to warm up the ink.
3. Class `Scanner` extends `Device` and overrides `start()` to calibrate the laser.
4. Class `MultiFunctionCopier` extends **both** `Printer` and `Scanner`.

If you create a `MultiFunctionCopier` object and call `start()`, which version of the method runs? The `Printer`'s or the `Scanner`'s? The compiler cannot decide, leading to a fatal ambiguity. Java avoids this entirely by restricting classes to a single parent.

#### **Interview Focus: The Java 8+ Twist**

While Java doesn't allow multiple inheritance of *state* (classes), it allows multiple inheritance of *type* (interfaces).

Before Java 8, interfaces only had abstract methods (no implementation), so there was no ambiguity. However, Java 8 introduced **default methods** in interfaces. This effectively reintroduced the Diamond Problem.

**How Java handles the Interface Diamond Problem:**
If a class implements two interfaces that contain a default method with the *exact same signature*, the Java compiler will throw an error. It forces the developer to manually resolve the ambiguity by overriding the method in the child class.

**Code Example:**

```java
interface Printer {
    default void start() {
        System.out.println("Warming up printer...");
    }
}

interface Scanner {
    default void start() {
        System.out.println("Calibrating scanner...");
    }
}

// This will NOT compile unless we resolve the ambiguity
class MultiFunctionCopier implements Printer, Scanner {
    
    @Override
    public void start() {
        // We must explicitly choose which parent's method to call,
        // or write an entirely new implementation here.
        
        Printer.super.start(); // Syntax to call a specific interface's default method
        Scanner.super.start();
        System.out.println("MultiFunctionCopier is ready.");
    }
}

```

**LLD Takeaway:** When designing systems, even if you could theoretically use multiple inheritance (in languages like C++ or Python), it generally creates tightly coupled, fragile code. This is why LLD principles strongly lean toward using Interfaces to define contracts and Composition to share behavior.

---

### **Topic 3: Constructors & Initialization Order**

When you create an object of a child class in Java, a highly specific sequence of events occurs in memory. Interviewers love testing this area because it exposes whether a candidate truly understands how the JVM constructs objects from the ground up.

#### **Constructor Chaining**

Constructors are responsible for initializing the state of an object. In inheritance, a child class *must* ensure its parent's state is initialized before it initializes its own. This creates a chain.

* **The Rule:** The very first line of any constructor must be either a call to another constructor in the same class (`this(...)`) or a call to the parent's constructor (`super(...)`).
* **The Hidden Step:** If you write neither, the Java compiler silently inserts `super();` (a call to the parent's no-args constructor) as the first line.
* **The Chain Reaction:** Because of this, when you instantiate a child class, the constructor calls travel all the way up the inheritance tree to `java.lang.Object`, and then complete execution from the top down.

#### **The Exact Initialization Order**

If you have a Parent class and a Child class, and you invoke `new Child()`, the JVM executes initialization in this exact order. **Memorize this sequence for interviews:**

1. **Parent Static:** Parent class static variables and static initializer blocks (executed in the order they appear in the code). *Note: Static elements run only once when the class is first loaded into memory.*
2. **Child Static:** Child class static variables and static initializer blocks.
3. **Parent Instance:** Parent class instance variables and instance initializer blocks.
4. **Parent Constructor:** The body of the parent class's constructor.
5. **Child Instance:** Child class instance variables and instance initializer blocks.
6. **Child Constructor:** The body of the child class's constructor.

#### **Interview Focus: Output Tracing Example**

Interviewers frequently provide code snippets and ask, "What is the output?"

```java
class Parent {
    static { System.out.println("1. Parent Static Block"); }
    
    { System.out.println("3. Parent Instance Block"); }
    
    public Parent() {
        System.out.println("4. Parent Constructor");
    }
}

class Child extends Parent {
    static { System.out.println("2. Child Static Block"); }
    
    { System.out.println("5. Child Instance Block"); }
    
    public Child() {
        // super(); is implicitly here
        System.out.println("6. Child Constructor");
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println("--- Creating first Child object ---");
        Child c1 = new Child();
        
        System.out.println("\n--- Creating second Child object ---");
        Child c2 = new Child();
    }
}

```

**The Output:**

> --- Creating first Child object ---
1. Parent Static Block
2. Child Static Block
3. Parent Instance Block
4. Parent Constructor
5. Child Instance Block
6. Child Constructor

> --- Creating second Child object ---

3. Parent Instance Block
4. Parent Constructor
5. Child Instance Block
6. Child Constructor

**Key Takeaway:** Notice how the static blocks *do not* run the second time `new Child()` is called. They belong to the class level, not the object level.

---

### **Topic 4: Method Overriding vs. Method Hiding**

This topic is the primary battleground for Java inheritance trick questions. Interviewers will relentlessly test your understanding of how the JVM resolves method calls and variable access when the reference type differs from the actual object type in memory.

#### **Method Overriding (Runtime Polymorphism)**

Overriding occurs when a subclass provides its own specific implementation of an *instance* method inherited from a parent class.

* **Resolution:** The JVM determines which method to execute at **runtime** based on the actual *object type* created in memory (the right side of the `=` sign).
* **The Rules:** The method signature (name and parameter list) must match exactly.
* **Covariant Return Types:** The return type must be the exact same type or a subclass of the parent's return type.
* **Access Modifiers:** The overriding method in the child class cannot be more restrictive than the parent's method (e.g., you cannot override a `public` method and restrict it to `protected`).

#### **Method Hiding (Compile-Time Resolution)**

Hiding occurs when a subclass defines a `static` method with the exact same signature as a `static` method in the parent class.

* **Resolution:** The compiler determines which method to execute at **compile time** based solely on the *reference type* (the left side of the `=` sign).
* **Variables:** It is crucial to remember that instance variables and static variables are *always* hidden, never overridden. Variable access is strictly determined by the reference type.

#### **The Impact of `final` and `private**`

* **`final`:** Methods marked as `final` cannot be overridden or hidden. Their implementation is permanently locked by the parent class.
* **`private`:** These methods are not inherited at all. If a child class creates a method with the exact same signature as a parent's private method, it is not overriding; it is simply creating a brand new, completely unrelated method.

#### **Interview Focus: The Classic Trick Question**

Interviewers will almost always present a scenario utilizing upcasting (e.g., `Parent ref = new Child();`) and ask you to predict the exact console output.

```java
class Vehicle {
    String type = "Generic Vehicle"; // Variables are hidden

    public void startEngine() { // Instance method (Overridden)
        System.out.println("Vehicle engine starting...");
    }

    public static void soundHorn() { // Static method (Hidden)
        System.out.println("Generic Beep!");
    }
}

class Car extends Vehicle {
    String type = "Sports Car";

    @Override
    public void startEngine() {
        System.out.println("V8 engine roaring!");
    }

    public static void soundHorn() {
        System.out.println("Loud Honk!");
    }
}

public class Main {
    public static void main(String[] args) {
        // Upcasting: Reference is Vehicle, Object is Car
        Vehicle myRide = new Car(); 

        // 1. Instance Method -> Resolved at RUNTIME (looks at Object: Car)
        myRide.startEngine(); 

        // 2. Static Method -> Resolved at COMPILE TIME (looks at Reference: Vehicle)
        myRide.soundHorn(); 

        // 3. Variable Access -> Resolved at COMPILE TIME (looks at Reference: Vehicle)
        System.out.println("Type: " + myRide.type); 
    }
}

```

**The Output:**

> V8 engine roaring!
> Generic Beep!
> Type: Generic Vehicle

**Key Takeaway for Interviews:** Whenever you see `A obj = new B();`, immediately remind yourself: instance methods look at `B` (the object), while static methods and variables look at `A` (the reference).

---

### **Topic 5: Inheritance in LLD & Composition Over Inheritance**

In Low-Level Design (LLD) interviews, the focus shifts from syntax to architecture. Interviewers want to see if you can structure a system that is scalable, maintainable, and loosely coupled. While inheritance is a fundamental OOP pillar, it is often a trap in system design if overused.

#### **1. UML Representation and the "IS-A" Relationship**

In LLD, you will often draw class diagrams before writing code.

* **Inheritance (IS-A):** Represented by a solid line with a hollow, closed arrowhead pointing from the child class to the parent class.
* **Tight Coupling:** Inheritance creates the strongest form of coupling in software design. The child is permanently bound to the parent's implementation details. If the parent changes, the child is directly impacted (often called the fragile base class problem).

#### **2. The Liskov Substitution Principle (LSP)**

In an LLD interview, you cannot discuss inheritance without mentioning the "L" in SOLID.

* **The Principle:** Objects of a superclass should be replaceable with objects of its subclasses without breaking the application.
* **The Classic Interview Violation:** You have a `Bird` class with a `fly()` method. You create an `Ostrich` class that extends `Bird`. Since ostriches cannot fly, you either throw an `UnsupportedOperationException` or leave the method empty. This violates LSP. The system expects any `Bird` to fly, and `Ostrich` breaks that contract.
* **The Fix:** Redesign the hierarchy. Have a generic `Bird` class, and then introduce interfaces like `Flyable` and `Runnable`.

#### **3. The Golden Rule: Composition Over Inheritance**

This is the most critical design principle regarding inheritance. Instead of inheriting behavior (IS-A), a class should be composed of behaviors (HAS-A).

**Why Composition Wins in LLD:**

1. **Flexibility at Runtime:** Inheritance is static (resolved at compile-time). Composition is dynamic. You can change the behavior of an object at runtime by swapping out its components.
2. **Prevents Class Explosion:** If you use inheritance for multiple variations (e.g., `ElectricCar`, `GasCar`, `ManualElectricCar`, `AutomaticGasCar`), you get a massive, unmanageable tree. With composition, you just compose a `Car` object with different `Engine` and `Transmission` objects.
3. **Encapsulation:** Inheritance breaks encapsulation because the child class is exposed to the parent's internal implementation. Composition interacts strictly through public interfaces.

#### **Interview Focus: Refactoring from Inheritance to Composition**

**The Anti-Pattern (Inheritance):**

```java
abstract class Notifier {
    public abstract void send(String message);
}

class EmailNotifier extends Notifier {
    public void send(String message) { System.out.println("Emailing: " + message); }
}

// What if we need to send an Email AND an SMS? 
// We would have to create an EmailAndSMSNotifier class. This leads to class explosion!

```

**The Standard LLD Pattern (Composition):**

```java
// 1. Define the behavior via an Interface
interface NotificationStrategy {
    void send(String message);
}

class EmailStrategy implements NotificationStrategy {
    public void send(String message) { System.out.println("Emailing: " + message); }
}

class SMSStrategy implements NotificationStrategy {
    public void send(String message) { System.out.println("SMS: " + message); }
}

// 2. The core class HAS-A strategy (Composition)
class NotificationService {
    private NotificationStrategy strategy;

    // We can inject any strategy dynamically
    public NotificationService(NotificationStrategy strategy) {
        this.strategy = strategy;
    }

    public void notifyUser(String message) {
        strategy.send(message);
    }
}

```

*Notice how `NotificationService` no longer extends anything. It simply holds a reference to a `NotificationStrategy`. This is the Strategy Design Pattern, a direct application of Composition over Inheritance.*

---

