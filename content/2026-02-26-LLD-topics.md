---
title: "LLD Interview Topics"
date: "2026-02-26"
tags: ["System design", "LLD"]
summary: "Fundamental of all LLD rounds"
pinned: true
---

## Topics 

### Object Oriented Design Principles

**Core OOP**
1. Abstraction
2. Encapsulation
3. Inheritance
4. Polymorphism

**SOLID Principles**
1. Single Responsibility
2. Open/closed
3. Liskov Substitution
4. Interface Segregation
5. Dependency Inversion

**Additional Design Principles**
1. DRY(Don't Repeat Yourself)
2. KISS(Keep it Simple, Stupid)
3. YAGIN
4. Composition > Inheritance
5. Immutability

### UML Diagrams
aware of draw/describe:
1. Class diagrams
2. sequence diagrams
3. Activity/State diagrams

### Design Pattern
**Creational Patterns**
1. Singleton
2. Factory, Factory Method
3. Abstract Factory
4. Builder
5. Prototype

**Structural Patterns**
1. Adapter
2. Decorator
3. Facade
4. Composite
5. Proxy

**Behavioral Patterns
1. Strategy
2. Observer
3. Command
4. Template Method
5. Iterator
6. Chain of Responsibility
7. State

>focus on when/why to use them

### Concurrency & Multithreading Design
1. Thread safety
2. Locks,mutex,semaphores
3. Producer-consumer
4. Rete Limiter design
5. Read-wirte Locks
6. Deadlocks & avoidance
7. Threads pools
8. Executors framework

### Low-level Design of Real System

**Object Modeling**
1. Parking lot
2. Elevator system
3. Library management
4. Movie-ticket booking
5. Airlines reservation
6. Hotel reservation
7. Meeting scheduler
8. Splitwise
9. Ride-sharing
10. Food delivery
11. Notification service
12. Logging service
13. Rate Limiter
14. Cache & LRU cache

**Game Designs**
1. Chess
2. Tic-Tac-Toe
3. Snake & ladder
4. Poker
5. Cricbuzz scoreboard

**API + Class Design**
1. Class responsibility breakdown
2. Model relationships
3. DTOs vs domain models
4. Interface-based design
5. Error Handling strategy
6. Modularization

**Database(Basic LLD perspective)**
1. Entities and relation modeling
2. Transactions (ACID basics)
3. Optimistic vs pessimistic locking
4. Pagination & filtering

### Coding-style LLD Topics
```text
1. Writing clean classes
2. Using interfaces & abstractions
3. Dependency Injection
4. Logging strategies
5. Configurations
6. Enum usage
7. Constants
8. Handling edge cases

```

### What Interviewers Actually Evaluate

```text
How you break down the problem
How you map real-world entities into objects
How well you justify design decisions
Class responsibilities(SRP)
Extensibility & maintainability
Handling concurrency
Ability to communicate clearly
Tradeoffs(simplicity vs flexibility)
```
    