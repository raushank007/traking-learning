---
title: "@Transactional"
date: "2026-03-02"
tags: ["Spring boot", "Spring JPA"]
summary: "Local balancers Layer 4 and Layer 7"
category: "General"
sessions:
  - date: "2026-03-01"
    startTime: "10:00"
    endTime: "10:30"
---

# What does @transactional actually do?
@Transactional make logical unit of work execute atomically, meaning:
1. All DB operations inside the method succeed together or fail together.
2. it sets a transactional boundary.
3. it gives you data consistency, not perfromace

## But can @Transactional make your code appear "faster" sometimes?
>Yes, in some specific cases - but not due to speed of saving or fetching.

1. It reduces multiple commits into one commit.
without transaction:
```java
repo.save(a); //commit
repo.save(b); //commit
repo.save(c); //commit
```

with @Transactional
```java
@Transactional
public void saveAll(){
    repo.save(a);
    repo.save(b);
    repo.save(c);
} // One final commit here -> less overhead
```

>commit is expensive. Fewer commits = slight performance improvement

2. It may reduces repeated flushes
Hibernate flushes before each query outside a transaction. Inside a transaction, Hibernate flushes only at the end, reducing round-trips.

## Recommended: When to use @Transactional ?
1. wirte/update/delete multiple records that must stay consistent.
2. perform read + write together
3. use lazy-loaded entities
4. perform business logic that spans multiple repositories
5. need ACID guarantees

## When NOT to use @Transactional in spring boot
1. Simple read-only queries


## Important Points About @Transactional(With example)

1. It only work when called via Spring Proxy

**X Wrong**
```java
@Service
public class VoucherService{
    @Transactional
    public void redeem(){...}
    
    public void process(){
        redeem(); // No TRANSACTION (proxy bypass)
    }
}
```
**CORRECT**

```java
@Service
public class VoucherService{
    @Transactional
    public void redeem(){}
}

@Service
public class ProcessingService{
    @Autowired VoucherService voucherService;
    
    public void process(){
        voucherService.redeem(); // TRANSACTION WORKS
    }
}

```

2. Only runtime exception trigger rollback(by default)

**Example**
```java
@Transactional
public void updateVoucher() throws IOException{
    saveVoucher();
    throw new IOException("checked exception");
}
```
**To roll back on checked exception**
```java
@Transational(rollbackFor=Exception.class)
```

3. Keep translations SHORT
>Long translations = deadlocks + connection pool starvation

**X Don't do this:**
```java
@Transational
public void processFile(MultipartFile file){
    Thread.sleep(5000);
    repo.save(...);
}
```

4. @Transational(readOnly = true) does NOT reduce DB locks

But it : avoid dirty checking, slightly improves hibernate performance
```java
@Transactional(readOnly=true)
public User getUSer(Long id){
    return userRepo.findById(id).get();
}
```

5. Transactions should be placed in service layer , not in controller
6.  REQUIRES_NEW starts a completely separate transation

User for : Audit logging, Notification logs, Non-critical DB writes

```java
@Transational
public void redeemVoucher(){
    saveRedeemptionRecord(); // part of main transaction
    auditService.log(); // separate transaction
}

@Transactional(propagation = Propagation.REQUIRES_NEW)
public void log(){}
```
7. Lazy loading requires a transaction

Otherwise -> `LazyIinitlaizationException`
```java
@Transactional
public User getUserWithOrders(Long id){
    User user = repo.findById(id).get();
    user.getOrders().size(); // OK inside transation
    return user;
}
```