---
title: "LLD Interview Topics"
date: "2026-02-26"
tags: ["System design", "LLD"]
summary: "Fundamental of all LLD rounds"
pinned: true
isRoadmap: true
---

## Topics

### Object Oriented Design Principles

**Core OOP**
- [X] Abstraction
- [ ] Encapsulation
- [ ] Inheritance
- [ ] Polymorphism

**SOLID Principles**
- [ ] Single Responsibility
- [ ] Open/closed
- [ ] Liskov Substitution
- [ ] Interface Segregation
- [ ] Dependency Inversion

**Additional Design Principles**
- [ ] DRY(Don't Repeat Yourself)
- [ ] KISS(Keep it Simple, Stupid)
- [ ] YAGIN
- [ ] Composition > Inheritance
- [ ] Immutability

### UML Diagrams
aware of draw/describe:
- [ ] Class diagrams
- [ ] sequence diagrams
- [ ] Activity/State diagrams

### Design Pattern
**Creational Patterns**
- [ ] Singleton
- [ ] Factory, Factory Method
- [ ] Abstract Factory
- [ ] Builder
- [ ] Prototype

**Structural Patterns**
- [ ] Adapter
- [ ] Decorator
- [ ] Facade
- [ ] Composite
- [ ] Proxy

**Behavioral Patterns**
- [ ] Strategy
- [ ] Observer
- [ ] Command
- [ ] Template Method
- [ ] Iterator
- [ ] Chain of Responsibility
- [ ] State

>focus on when/why to use them

### Concurrency & Multithreading Design
- [ ] Thread safety
- [ ] Locks,mutex,semaphores
- [ ] Producer-consumer
- [ ] Rete Limiter design
- [ ] Read-wirte Locks
- [ ] Deadlocks & avoidance
- [ ] Threads pools
- [ ] Executors framework

### Low-level Design of Real System

**Object Modeling**
- [ ] Parking lot
- [ ] Elevator system
- [ ] Library management
- [ ] Movie-ticket booking
- [ ] Airlines reservation
- [ ] Hotel reservation
- [ ] Meeting scheduler
- [ ] Splitwise
- [ ] Ride-sharing
- [ ] Food delivery
- [ ] Notification service
- [ ] Logging service
- [ ] Rate Limiter
- [ ] Cache & LRU cache

**Game Designs**
- [ ] Chess
- [ ] Tic-Tac-Toe
- [ ] Snake & ladder
- [ ] Poker
- [ ] Cricbuzz scoreboard

**API + Class Design**
- [ ] Class responsibility breakdown
- [ ] Model relationships
- [ ] DTOs vs domain models
- [ ] Interface-based design
- [ ] Error Handling strategy
- [ ] Modularization

**Database(Basic LLD perspective)**
- [ ] Entities and relation modeling
- [ ] Transactions (ACID basics)
- [ ] Optimistic vs pessimistic locking
- [ ] Pagination & filtering

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