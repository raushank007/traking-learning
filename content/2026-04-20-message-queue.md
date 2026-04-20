---
title: "Message Queue"
date: "2026-04-20"
tags: [ "HLD","Message Queue"]
summary: ""
category: "HLD"
sessions:
  - date: "2026-04-20"
    startTime: "07:30"
    endTime: "07:48"
---

# Message Queues & Event Streaming



## 1. The Fundamentals of Message Queues

### The Problem with Direct Calls
Synchronous API calls (e.g., HTTP REST) fail under bursty traffic, introduce high latency for heavy tasks, and create fragile, tightly coupled systems. If a downstream service crashes, the upstream service is stuck.

### The Solution: Decoupling
A message queue acts as a buffer. Producers drop a message and immediately return a response. Consumers pull work off the queue at their own pace.

### When to Introduce a Queue (Interview Signals)
Look for these four signals in an interview prompt to justify adding a queue:
1. **Asynchronous Work:** The user does not need an immediate result (e.g., video processing, sending emails).
2. **Bursty Traffic:** Absorbing unpredictable spikes in load without dropping requests.
3. **Independent Scaling:** The producer and consumer have different hardware or scaling needs (e.g., lightweight API vs. GPU-heavy ML workers).
4. **Strict Reliability:** Ensuring data isn't lost if a downstream service goes temporarily offline.

---

## 2. Core Mechanics & Delivery Guarantees

### Acknowledgements (ACKs)
Queues do not instantly delete messages. A consumer must explicitly send an ACK after processing. If it crashes mid-process, the queue assumes failure and redelivers the message.

### Delivery Guarantees
* **At-Most-Once:** "Fire and forget." The message is sent once. If it fails, it is lost forever. Used for analytics/metrics.
* **At-Least-Once (Industry Standard):** The queue guarantees delivery, but retries on failure can lead to the same message being delivered multiple times. **Consumers must be idempotent.**
* **Exactly-Once:** Extremely difficult in distributed systems. Usually requires native framework support (like Kafka Streams) and transactional boundaries.

---

## 3. Advanced Architectural Concepts

For SDE 2/3 interviews, you must discuss how the queue behaves under stress.

* **Scaling via Partitions:** A single queue has throughput limits. To scale horizontally, queues are split into partitions. Pools of workers (Consumer Groups) divide these partitions to process in parallel.
* **The Partition Key Trade-off:** Messages with the same key always go to the same partition, ensuring strict ordering. The architectural challenge is balancing **strict ordering** against **even distribution** (avoiding "hot partitions").
* **Backpressure:** If producers generate messages faster than consumers can process them, the queue will run out of memory. You must apply backpressure (e.g., rate-limiting or returning 429 Too Many Requests to the producer).
* **Dead Letter Queues (DLQ):** "Poisoned messages" (e.g., corrupted JSON) will cause consumers to crash and retry infinitely. Configuring a maximum retry count routes these unprocessable messages to a DLQ for manual inspection.

---

## 4. Kafka vs. RabbitMQ: Architectural Comparison

### RabbitMQ (The Traditional Message Broker)
* **Mental Model:** A "smart broker with simple consumers." It actively routes messages to specific queues and deletes them as soon as they are ACKed.
* **Performance:** ~10,000 messages/sec. Ultra-low latency (1–5ms).
* **Use Cases:** Task queues, background jobs (image resizing, sending emails), complex routing. Ideal when work just needs to get done and disappear.

### Kafka (The Distributed Commit Log)
* **Mental Model:** A "simple broker with smart consumers." It is an append-only distributed log. Messages persist on disk. Consumers track their own reading position (offset).
* **Performance:** 1,000,000+ messages/sec. Higher latency (5–50ms).
* **Use Cases:** Durable event streams where multiple independent systems (analytics, billing, search) read the *same* data. Allows replaying historical data.

---

## 5. Kafka Architecture Deep Dive

* **Topics:** Logical category for records.
* **Partitions:** The unit of scale. An ordered, immutable sequence of records.
* **Brokers:** The actual servers. Partitions are replicated across brokers for high availability.
* **Offsets:** A sequential ID assigned to every message. Consumers use offsets to track what they have read.
* **KRaft:** Modern Kafka's metadata management system, replacing ZooKeeper.

---

## 6. Achieving "Exactly-Once" Processing

Because Kafka defaults to At-Least-Once delivery, you must handle duplicate reads.

### Method 1: Idempotent Consumers (The Practical Way)
* **How it works:** The consumer reads the message and checks its own database (`SELECT 1 FROM processed_events WHERE id = X`). If the ID exists, it ignores the message. If not, it processes the business logic and inserts the ID into the database in a single atomic transaction.
* **Why it's used:** It is the only way to achieve exactly-once impact when writing to external databases (PostgreSQL, MongoDB) or calling external APIs.

### Method 2: Kafka Exactly-Once Semantics (EOS)
* **How it works:** Uses transactional APIs and idempotent producers (`enable.idempotence=true`). 
* **Limitation:** Only works for "Read-Process-Write" workflows entirely contained *within* the Kafka ecosystem (reading from Topic A, writing to Topic B).

---

## 7. System Design Risks & Mitigations (with Spring Boot Code)

### Risk 1: The "Poison Pill" (Stuck Consumer)
* **Cause:** A malformed message throws an exception, preventing offset commit. The consumer retries infinitely, blocking the partition.
* **Mitigation:** Dead Letter Topic (DLT) routing.
* **Spring Boot Implementation:** Use `@RetryableTopic` to automatically handle retries and route to a DLT upon exhaustion.

```java
import org.springframework.kafka.annotation.RetryableTopic;
import org.springframework.kafka.annotation.DltHandler;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.retry.annotation.Backoff;

@Service
public class OrderConsumer {

    // Automatically retries 3 times, backing off, then sends to "orders.DLT" topic
    @RetryableTopic(
        attempts = "3",
        backoff = @Backoff(delay = 1000, multiplier = 2.0),
        autoCreateTopics = "false",
        dltTopicSuffix = ".DLT"
    )
    @KafkaListener(topics = "orders", groupId = "order-group")
    public void processOrder(OrderEvent event) {
        // If this throws an exception, Spring catches it and handles the retry/DLT logic.
        executeBusinessLogic(event);
    }

    // Listener for the Dead Letter Topic to log or alert admins
    @DltHandler
    public void handleDltMessage(OrderEvent event, @Header(KafkaHeaders.EXCEPTION_MESSAGE) String error) {
        System.err.println("Poison pill moved to DLT: " + event.getId() + ". Error: " + error);
    }
}
```

### Risk 2: Hot Partitions
* **Cause:** Poor partition key choice (e.g., partitioning by "Country" where 90% of traffic is US) causes one consumer to be overloaded while others idle.
* **Mitigation:** Use a highly cardinal, evenly distributed key (e.g., `UserId`).
* **Spring Boot Implementation:** Ensure the producer explicitly sets the key when sending.

```java
@Service
public class EventProducer {
    private final KafkaTemplate<String, UserEvent> kafkaTemplate;

    public void sendUserEvent(UserEvent event) {
        // The SECOND argument is the partition key. 
        // Using a high-cardinality ID like UserId ensures even distribution across partitions.
        kafkaTemplate.send("user-events", event.getUserId(), event);
    }
}
```

### Risk 3: Data Loss (Acks and Replicas)
* **Cause:** The producer considers a message "sent" the moment the leader broker receives it. If that broker crashes before replicating, the data is lost.
* **Mitigation:** Force the producer to wait for all replicas to acknowledge (`acks=all`).
* **Spring Boot Implementation:** This is best handled in your `application.yml` configuration.

```yaml
spring:
  kafka:
    producer:
      # Wait for leader and all in-sync replicas to acknowledge
      acks: all
      # Retries in case of transient network errors
      retries: 3
```

### Risk 4: Consumer Rebalance Storms
* **Cause:** A consumer takes too long to process a batch of messages. The broker thinks the consumer died, kicks it out, and triggers a "rebalance" (halting all processing).
* **Mitigation:** Tune consumer polling intervals and batch sizes to ensure the consumer always checks in with the broker on time.
* **Spring Boot Implementation:** Adjust these settings in `application.yml`.

```yaml
spring:
  kafka:
    consumer:
      # Reduce the number of records pulled per batch (default is usually 500)
      max-poll-records: 50
      properties:
        # Increase the time allowed to process a batch before being marked as dead (default is 300000ms / 5 mins)
        max.poll.interval.ms: 600000 
```

---

## 8. Real-World Spring Boot Implementations

### 1. Decoupling (RabbitMQ)
```java
// Producer
@Service
public class ImageUploadService {
    private final RabbitTemplate rabbitTemplate;
    public void handleUpload(String imageId, String s3Url) {
        rabbitTemplate.convertAndSend("image-exchange", "routing.image", new ImageEvent(imageId, s3Url));
    }
}

// Consumer
@RabbitListener(queues = "image_processing_queue")
public void processImage(ImageEvent event) {
    // Download, resize, update DB
}
```

### 2. Idempotency (PostgreSQL + RabbitMQ/Kafka)
```java
@RabbitListener(queues = "payment_queue")
@Transactional
public void processPayment(PaymentEvent event) {
    if (eventRepo.existsById(event.getEventId())) {
        return; // Duplicate ignored
    }
    paymentGateway.charge(event.getUserId(), event.getAmount());
    eventRepo.save(new ProcessedEvent(event.getEventId()));
}
```

### 3. Partitioning & Ordering (Kafka)
```java
// Producer: Sending with AccountId as Partition Key
public void publishTransaction(Transaction transaction) {
    kafkaTemplate.send("financial-transactions", transaction.getAccountId(), transaction);
}

// Consumer: Guaranteed ordered processing per account
@KafkaListener(topics = "financial-transactions", groupId = "risk-engine")
public void evaluateRisk(Transaction transaction) {
    // Process sequentially
}
```

## 9. Broker Configurations (`application.yml` / `application.properties`)

Understanding how to tune the broker configurations is a common expectation in Senior (SDE 2/3) interviews, as it directly impacts durability, throughput, and backpressure.

### 1. Kafka Configuration
Kafka's configuration is split strictly between how the app behaves as a producer and as a consumer.

```yaml
spring:
  kafka:
    # 1. Cluster Connection
    bootstrap-servers: localhost:9092
    
    producer:
      # Serializers convert Java objects to bytes for network transfer
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      # DURABILITY: 'all' means the leader and all replicas must acknowledge the message.
      # '1' means just the leader, '0' means fire-and-forget (high data loss risk).
      acks: all
      # BATCHING: How much time (ms) to wait to group messages into a single batch before sending. 
      # Increases throughput at the cost of a few milliseconds of latency.
      properties:
        linger.ms: 5 
      
    consumer:
      group-id: risk-engine-group
      # Deserializers convert bytes back to Java objects
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      # REBALANCING: If a new consumer joins, where should it start reading?
      # 'earliest' = read from the beginning of the log. 'latest' = read only new messages.
      auto-offset-reset: earliest
      # ACKNOWLEDGEMENT: Disables auto-committing offsets. Forces your code to manually 
      # acknowledge processing success to prevent message loss on crashes.
      enable-auto-commit: false 
      properties:
        # HEARTBEAT: Max time allowed to process a poll before Kafka assumes the consumer died.
        max.poll.interval.ms: 300000 
```

### 2. RabbitMQ Configuration
RabbitMQ configuration heavily focuses on connection management and prefetching (backpressure).

```yaml
spring:
  rabbitmq:
    # 1. Broker Connection
    host: localhost
    port: 5672
    username: guest
    password: guest
    # VIRTUAL HOST: Logical grouping of queues (like databases in MySQL)
    virtual-host: /
    
    listener:
      simple:
        # ACKNOWLEDGEMENT: 'manual' forces your code to call channel.basicAck().
        # If 'auto', RabbitMQ deletes the message the moment it hands it to the consumer (risky).
        acknowledge-mode: manual
        # BACKPRESSURE (Crucial for RabbitMQ): Determines how many unacknowledged 
        # messages the broker will push to a single consumer at once. 
        # If 10, the consumer handles 10 at a time. Prevents OOM (Out of Memory) errors.
        prefetch: 10
        # CONCURRENCY: How many threads per queue listener.
        concurrency: 3
        max-concurrency: 10
        
    template:
      # RETRIES: If the broker is temporarily unreachable when producing a message.
      retry:
        enabled: true
        initial-interval: 1000ms
        max-attempts: 3
        multiplier: 2.0
```

### 3. Amazon SQS Configuration
To use SQS in Spring Boot, you typically use the **Spring Cloud AWS** library (`io.awspring.cloud:spring-cloud-aws-starter-sqs`).

```yaml
spring:
  cloud:
    aws:
      # 1. AWS Authentication
      credentials:
        access-key: YOUR_ACCESS_KEY
        secret-key: YOUR_SECRET_KEY
      region:
        static: us-east-1
        
      sqs:
        # ENDPOINT: Used for testing locally with LocalStack. Comment out for production.
        endpoint: http://localhost:4566 
        
        listener:
          # BATCHING: How many messages to pull from SQS in a single network request. 
          # Max is 10. Higher batch = lower AWS API costs and higher throughput.
          max-messages-per-poll: 10
          # ACKNOWLEDGEMENT: 'ON_SUCCESS' automatically deletes the message from SQS 
          # if your @SqsListener method completes without throwing an exception.
          acknowledge-mode: ON_SUCCESS
          # CONCURRENCY: How many parallel threads should be polling the SQS queue.
          max-concurrent-messages: 20
```

## 10. Essential Spring Boot Annotations Cheat Sheet

In a system design or machine coding round, knowing exactly which annotations bind your architecture to the framework is critical. Here is a cheat sheet for Kafka, RabbitMQ, and SQS.

### 1. Configuration Annotations
Used on classes to bootstrap the messaging infrastructure and define Beans (like Queues, Exchanges, or custom error handlers).

* `@Configuration`: Standard Spring annotation indicating the class contains `@Bean` definition methods.
* `@EnableKafka`: Scans your application for the `@KafkaListener` annotation and provisions the underlying listener containers.
* `@EnableRabbit`: Scans for `@RabbitListener` annotations to initialize RabbitMQ consumers.

```java
@Configuration
@EnableKafka // Optional in standard Spring Boot auto-config, but explicit is good practice
public class MessagingConfig {
    // Define custom Beans here if application.yml is not enough
}
```

### 2. Producer Annotations
Interestingly, Spring Boot **does not have specific "Producer" annotations**. Producing messages is done using standard Dependency Injection (`@Service` or `@Component`) and injecting the framework-provided Template classes.

* **Kafka:** Inject `KafkaTemplate<KeyType, ValueType>`
* **RabbitMQ:** Inject `RabbitTemplate`
* **Amazon SQS:** Inject `SqsTemplate` (from Spring Cloud AWS)

```java
@Service
public class OrderProducer {
    private final KafkaTemplate<String, Order> kafkaTemplate;

    public OrderProducer(KafkaTemplate<String, Order> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void send(Order order) {
        kafkaTemplate.send("order-topic", order.getId(), order);
    }
}
```

### 3. Consumer (Listener) Annotations
These are method-level annotations that tell Spring to continuously run this method in a background thread, feeding it messages pulled from the broker.

* `@KafkaListener`: Binds a method to a Kafka topic.
    * *Key Properties:* `topics`, `groupId`, `concurrency` (how many threads to spin up).
* `@RabbitListener`: Binds a method to a RabbitMQ queue.
    * *Key Properties:* `queues`, `ackMode`.
* `@SqsListener`: Binds a method to an SQS queue.

```java
@Component
public class InventoryConsumer {

    // KAFKA
    @KafkaListener(topics = "order-topic", groupId = "inventory-group", concurrency = "3")
    public void consumeKafka(Order order) {
        // Process order
    }

    // RABBITMQ
    @RabbitListener(queues = "order_queue")
    public void consumeRabbit(Order order) {
        // Process order
    }
}
```

### 4. Error Handling & Dead Letter Queues (DLQ) Annotations
Handling failures gracefully is a senior-level requirement.

#### Kafka-Specific Error Handling
Kafka introduced native annotation support for retry logic and DLQ routing in newer versions of Spring Kafka.

* `@RetryableTopic`: Placed on top of `@KafkaListener`. It automatically creates retry topics (e.g., `topic-retry-0`, `topic-retry-1`) and backs off before retrying. If all retries fail, it routes to a DLT.
* `@DltHandler`: Defines the method that will process the message once it officially fails all retries and lands in the Dead Letter Topic.

```java
@Service
public class PaymentConsumer {

    @RetryableTopic(
        attempts = "4", 
        backoff = @Backoff(delay = 2000, multiplier = 2.0),
        dltTopicSuffix = "-dead-letter" // Routes to "payment-topic-dead-letter" on failure
    )
    @KafkaListener(topics = "payment-topic", groupId = "payment-group")
    public void processPayment(Payment event) {
        // If an exception is thrown here, Spring intercepts it and triggers the retry topic.
    }

    @DltHandler
    public void handleFailedPayment(Payment event, @Header(KafkaHeaders.EXCEPTION_MESSAGE) String error) {
        // Executed only when all 4 attempts fail. 
        // Save to a database for manual review, or trigger an alert.
    }
}
```

#### RabbitMQ Error Handling
RabbitMQ doesn't use `@RetryableTopic`. Instead, you configure DLQs infrastructurally (via `application.yml` or `@Bean` Queue definitions). However, you can attach specific error handlers to the listener.

* `errorHandler`: A property inside `@RabbitListener` that points to a specific Bean implementing `RabbitListenerErrorHandler` to catch exceptions without crashing the consumer.

```java
@RabbitListener(queues = "invoice_queue", errorHandler = "customRabbitErrorHandler")
public void processInvoice(Invoice invoice) {
    // If it fails, "customRabbitErrorHandler" bean decides what to do
}
```