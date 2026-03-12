---
title: "Spring Boot Mastery Roadmap"
date: "2026-03-07"
tags: ["springboot", "framework", "backend"]
summary: "Comprehensive Spring Boot syllabus from core IoC mechanics to advanced transaction management and microservices."
pinned: true
isRoadmap: true
---

## 1. Spring Core Mechanics

| Category | Topic | Status | Revisions | Log Link                                                                                                                            |
| :--- | :--- | :---: | :---: |:------------------------------------------------------------------------------------------------------------------------------------|
| Core | Inversion of Control (IoC) and Dependency Injection (DI) | [x] | 0 | [Read log](/2026-02-07-IOC-Dependecy)                                                                                               |
| Core | `ApplicationContext` vs `BeanFactory` | [x] | 0 | [Read Log](/2026-02-07-IOC-Dependecy)                                                                                               |
| Beans | Bean Scopes (Singleton, Prototype, Request) & Thread Safety | [x] | 0 | [Read Log](/2026-02-07-IOC-Dependecy)                                                                                               |
| Beans | Bean Lifecycle (`@PostConstruct`, `InitializingBean`, `@PreDestroy`) | [x] | 0 | [Read Log](/2026-02-07-IOC-Dependecy)                                                                                               |
| Beans | `BeanPostProcessor` and Custom Bean Modification | [x] | 0 | [Read Log](/2026-02-07-IOC-Dependecy)                                                                                                                                    |
| AOP | Aspect-Oriented Programming (Proxies, Pointcuts, Advice) | [ ] | 0 | -                                                                                                                                   |
| Events | Application Events (`ApplicationEventPublisher`, `@EventListener`) | [ ] | 0 | -                                                                                                                                   |

## 2. Spring Boot Under the Hood

| Category | Topic | Status | Revisions | Log Link |
| :--- | :--- | :---: | :---: | :--- |
| Internals | How `@SpringBootApplication` works internally | [ ] | 0 | - |
| Auto-Config | Auto-configuration (`@EnableAutoConfiguration`, `spring.factories`) | [ ] | 0 | - |
| Conditions | Conditional Bean Loading (`@ConditionalOnClass`, `@ConditionalOnProperty`) | [ ] | 0 | - |
| Extensions | Creating a Custom Spring Boot Starter | [ ] | 0 | - |
| Config | Externalized Configuration and Property Resolution Order | [ ] | 0 | - |
| Ops | Spring Boot Actuator Internals and Custom Metrics | [ ] | 0 | - |

## 3. Web, REST & Reactive Design

| Category | Topic | Status | Revisions | Log Link |
| :--- | :--- | :---: | :---: | :--- |
| Architecture| `DispatcherServlet` Architecture and Request Lifecycle | [ ] | 0 | - |
| Middleware | Filters vs Interceptors (Execution order and use cases) | [ ] | 0 | - |
| Exceptions | Global Exception Handling (`@ControllerAdvice`, `@ExceptionHandler`) | [ ] | 0 | - |
| APIs | Content Negotiation and `HttpMessageConverters` | [ ] | 0 | - |
| APIs | DTO Validation (`@Valid`, BindingResult) & API Versioning | [ ] | 0 | - |
| Async | Asynchronous Request Processing (`DeferredResult`, `Callable`) | [ ] | 0 | - |
| Reactive | Spring WebFlux Basics (Mono, Flux, Netty vs Tomcat) | [ ] | 0 | - |

## 4. Data Access, JPA & Hibernate

| Category | Topic | Status | Revisions | Log Link |
| :--- | :--- | :---: | :---: | :--- |
| Hibernate | `EntityManager` and Hibernate Session Lifecycle | [ ] | 0 | - |
| Hibernate | Entity States (Transient, Persistent, Detached, Removed) | [ ] | 0 | - |
| Performance | The N+1 Select Problem and solutions (`JOIN FETCH`, `@EntityGraph`) | [ ] | 0 | - |
| Performance | Caching in Hibernate (L1 vs L2 Cache, Query Cache) | [ ] | 0 | - |
| Performance | Connection Pooling Internals (HikariCP) | [ ] | 0 | - |
| Transactions| `@Transactional` Proxies & The Self-Invocation Problem | [ ] | 0 | - |
| Transactions| Transaction Propagation Behaviors and Isolation Levels | [ ] | 0 | - |
| Concurrency | Optimistic vs Pessimistic Locking (`@Version`, `LockModeType`) | [ ] | 0 | - |

## 5. Spring Security

| Category | Topic | Status | Revisions | Log Link |
| :--- | :--- | :---: | :---: | :--- |
| Architecture| `DelegatingFilterProxy` and the `SecurityFilterChain` | [ ] | 0 | - |
| Concepts | Authentication vs Authorization Architectures | [ ] | 0 | - |
| Tokens | Implementing Stateless JWT Security | [ ] | 0 | - |
| OAuth | OAuth2 and OpenID Connect Flows | [ ] | 0 | - |
| Defense | CORS and CSRF Protection Mechanics | [ ] | 0 | - |
| Granular | Method Level Security (`@PreAuthorize`, `@Secured`) | [ ] | 0 | - |

## 6. Microservices, Async & Messaging

| Category | Topic | Status | Revisions | Log Link |
| :--- | :--- | :---: | :---: | :--- |
| Async | Asynchronous Processing (`@Async`) & custom `TaskExecutor` | [ ] | 0 | - |
| Caching | Spring Caching Abstraction (`@Cacheable`, `@CacheEvict`) with Redis | [ ] | 0 | - |
| Gateway | Spring Cloud Gateway and Route Predicates | [ ] | 0 | - |
| Resilience | Circuit Breakers, Retries, and Bulkheads (Resilience4j) | [ ] | 0 | - |
| Observability| Distributed Tracing (Micrometer, OpenTelemetry, MDC context passing) | [ ] | 0 | - |
| Messaging | Integrating Kafka/RabbitMQ with Spring Boot | [ ] | 0 | - |

## 7. Testing Ecosystem

| Category | Topic | Status | Revisions | Log Link |
| :--- | :--- | :---: | :---: | :--- |
| Integration | Integration Testing with `@SpringBootTest` and Testcontainers | [ ] | 0 | - |
| Slices | Web Layer Testing (`@WebMvcTest`, `MockMvc`) | [ ] | 0 | - |
| Slices | Data Layer Testing (`@DataJpaTest`) | [ ] | 0 | - |
| Mocking | `@MockBean` vs standard Mockito `@Mock` | [ ] | 0 | - |

---

## 💡 What Interviewers Evaluate in Spring Boot

For SDE 2/3 roles, interviewers are looking beyond basic annotations. They want to know:
1. **Proxy Mechanics:** Do you understand how Spring wraps your classes in CGLIB/JDK proxies for `@Transactional`, `@Async`, and `@Cacheable`? Do you know why calling an `@Async` method from within the *same* class fails?
2. **Context & Scopes:** How do you handle a Prototype bean injected into a Singleton bean?
3. **Hibernate Gotchas:** Can you spot an N+1 query issue? Do you know the difference between `save()` and `saveAndFlush()`?
4. **Thread Safety:** Are your Controllers and Services truly stateless and thread-safe?
5. **Boot Internals:** If a library isn't auto-configuring, do you know how to debug `spring.factories` or the condition evaluation report?