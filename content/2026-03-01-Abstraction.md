---
title: "Abstraction"
date: "2026-03-01"
tags: ["LLD", "Networking & Communication"]
summary: "Hiding complexity + Showing Essentials"
category: "LLD"
sessions:
  - date: "2026-03-01"
    startTime: "01:53"
    endTime: "02:40"
---

# Abstraction

Abstraction is the concept of hiding complex internal implementation details and expose high level functionality to the outside world.

>Abstraction is about creating a simplified view of a system

```text
Example:-
while driving a car:
We turn steering wheel, press the accelerator,and shift the gears.

But we don't need to know 
1. How the transition works 
2. How the fuels is injected
3. How torque or combustion is calculated
```

>It separates the WHAT IT DOES from the HOW IT DOSES IT.

Example : `EmailNotification` is a `Notification`. `SMSNotification` is a `Notification`.

if every notification needs a `sentTime` (variable/state) and a `logToConsole()`(shared Logic), put it here

```text
Why do we still need Abstract Classes?

The memory Rule:
1. Interfaces are stateless. They live in the code but have no "storage" in the object instance. They cannot have instance variables(fields).
2. Abstract classes are "Stateful".They can have fields(`private int retryCount`).When we instantiate a child, memory is allocated for these fields.
```

### Architectural Safety :
Abstract method acts as a "To-Do" list for the developer.


In complex system(like spring boot or Large scale LLD), we use a three-tier hierarchy:
1. Interface(`IPaymentGateway`) : Define the public API.
2. Abstract class(`BasePaymentGateway`) : Implements the interface .It holds common state(API keys, Timeout settings) and shared logic(Logging,Error handling)
3. Concrete class(`StripeGateway`) : Extends the Abstract class.It only contains the code specific to Stripe's api.


**Important questions**
1. Can an interface have a constructor? No
2. Why use an abstract class for a Database Repo? (To share the connection object state)
