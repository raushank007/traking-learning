---
title: "Encapsulation"
date: "2026-03-11"
tags: ["OOPs", "LLD"]
summary: "We expose only what is necessary using public methods, and hide the rest using private/protected fields"
category: "LLD"
sessions:
  - date: "2026-03-11"
    startTime: "00:43"
    endTime: "01:08"
---

# Encapsulation

## Core concept & Real-world scenario

It refers to the bundling of data(variables) and the methods(functions) that operate on that data into a single unit.(class) and it restricts direct,external access to the internal state of the object, requiring all interactions to go through designated methods.

**Real-Lide Scenario**
Imagine a `BankAccount` system.<br>
1. The Data : The account `balance`.
2. The Methods : `deposit()` and `withdraw()`

if the `balance` is not encapsulated, any other part of the software can directly access and change it.(e.g., `account.balance` = 5000000).

By encapsulating the `BankAccount`:
1. We lock the `balance` variable inside the class so it cannot be touched directly from the outside.
2. We force the rest of the program to use the `deposit()` or `withdraw()` methods.
3. Inside those methods,we can add validation logic(e.g., checking if the withdrawal amount is greater than the current balance, or ensuring a deposit isn't a negative number.)

## The "why" (Data Hiding vs Encapsulation)

| Encapsulation is the physical bundling of data and methods into a single class. | Data Hiding is the restriction of access to that internal data |
|---------------------------------------------------------------------------------|----------------------------------------------------------------|

## The "How" (Implementation)
```java
public class BankAccount {
    // 1. Data Hiding: The field is private
    private double balance; 

    // 2. The Getter: Controlled Read Access
    public double getBalance() {
        // We could add logic here, like logging who checked the balance
        return balance; 
    }

    // 3. The Setter: Controlled Write Access
    public void deposit(double amount) {
        // Validation logic: Reject negative deposits
        if (amount > 0) {
            balance += amount;
        } else {
            System.out.println("Error: Deposit amount must be positive.");
        }
    }
}
```


## Topic 4: Encapsulation Interview Deep Dive

**1. Designing Immutable Classes**
Interviewers frequently ask how to make an object completely read-only after it is created. You must mention these three specific steps:

* **`final` class:** Prevents other classes from extending your class and overriding your methods to change behavior.
* **`private final` fields:** `private` hides the data, and `final` ensures the value cannot be changed once the constructor finishes executing.
* **No Setters:** Only provide getters so the outside world can read, but never write, the data.

**2. Defeating "Leaky Encapsulation"**
This tests if you understand how memory references work in Java. Returning a mutable object (like a `List`, `Date`, or a custom object) via a getter "leaks" a reference to your internal data.

* **The Problem:** The calling class can use that reference to modify your internal state, bypassing your setters completely.
* **The Solution:** Use **defensive copying**. Return a copy of the data, not the original reference.
* **Shallow vs. Deep Copy:** For a list of immutable objects (like `String`), returning `Collections.copyOf(list)` is sufficient. For a list of mutable objects, you must create a true deep copy by instantiating new objects for every item in the list.

**3. The Private Constructor Trick**
Encapsulation isn't just for fields; it applies to methods and constructors too.

* **Scenario:** If an interviewer asks how to prevent a class from being instantiated at all (like a `MathUtils` class that only has static methods), or how to strictly limit it to a single instance (the Singleton pattern).
* **Solution:** You encapsulate the constructor by making it `private`.

---
