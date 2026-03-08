---
title: "Asynchronous Kafka Request-Reply"
date: "2026-03-08"
tags: ["Springboot", "Network & Communication","Kafka", "ReplyKafkaTemplate"]
summary: "Facing issue in Production of acknowledgement timeout"
category: "springboot"
sessions:
  - date: "2026-03-08"
    startTime: "09:54"
    endTime: "10:54"
---

# Asynchronous Kafka Request-Reply 

## Internal Mechanics

When we warp a `ReplyingKafkaTemplate` call inside a `CompletableFuture.runAsync()`, we are combining Java's asynchronous task execution with Spring kafka's request/reply pattern.

STEP-BY-STEP internal flow:
1. Task offloading: When `runAsync()` is invoked, the JVM takes the lambda expression and hands it off to a thread pool(by default, the ForkJoinPool.commonPool()). The main application thread immediately moves on, returning control to the caller(eq., an HTTP thread).
2. Header Injection : Inside the async thread, when `replyingKafkaTemplate.sendAndReceive(record)` is called, Spring intercepts the message. It automatically generates a unique(record) is called, Spring intercepts the message.It automatically generates a unique `correlation ID` and injects it into the kafka headers.It also injects the `REPLY_TOPIC` header so the consumer knows where to send the response.
3. Suspended State : The templete sends the message to the main kafka topic and returns a `RequestReplyfuture`.Internally, Spring stores this correlation Id in a concurrent map(a "pending replies" map) waiting for a match.
4. The Reply : the downstream consumer processes the message and sends a response to the reply topic, keeping the original correlation ID attached.
5. Reconciliation: A dedicated `KafkaMessageListenerContainer` in our Spring boot application constantly polls the reply topic. When it reads the reply, it extracts the correlation ID, looks it up in the concurrent map, and completes the waiting `RequestReplyfuture` with the result.

Let's set up your local environment to see this bottleneck in action, implement the fixes we discussed, and summarize the architecture.

### 1️⃣ How to Reproduce the Error Locally (IntelliJ Community)

To see the broadcast issue and the partition bottleneck, you need to run two instances of your Spring Boot application simultaneously.

**Step 1: Configure IntelliJ for Multiple Instances**

1. In IntelliJ, open the **Run/Debug Configurations** dialog (click the dropdown next to the run button at the top right and select "Edit Configurations").
2. Select your Spring Boot application configuration.
3. Click **Modify options** (or look for the **Build and run** section) and check the box for **Allow multiple instances**.
4. To prevent port conflicts, duplicate the configuration. For the first one, leave it as is (default port 8080). For the second one, add `-Dserver.port=8081` to the VM options or `server.port=8081` to the program arguments.

**Step 2: Prepare Kafka**
Ensure your local Kafka cluster is running and that your reply topics (`vocherReplyTopics` and `voucherUserRecordReplyTopics`) are created with at least **2 partitions**.
`kafka-topics.sh --alter --topic voucher-reply-topic --partitions 2 --bootstrap-server localhost:9092`

**Step 3: Trigger the Issue**

1. Start Instance 1 (port 8080) and Instance 2 (port 8081).
2. Send an HTTP request to Instance 1 that triggers the `CompletableFuture.runAsync()`.
3. **Observe the Logs:** You will see Instance 1 successfully complete the request. However, check the terminal tab for Instance 2. You will see a warning log from Spring Kafka stating something like: `No pending reply: <Correlation-ID>. Perhaps the reply arrived after the timeout...`. This proves both instances are receiving the same message due to the random group ID.
4. **Trigger the Timeout:** Use a load-testing tool (like JMeter or Apache Bench) to send 500 concurrent requests to Instance 1. Because your `ProductRecord` hardcodes partition `0`, all 500 replies will queue up in partition 0. The default `ForkJoinPool` will freeze, and you will start seeing `KafkaReplyTimeoutException` in your logs.

---

### 2️⃣ How to Resolve the Issues

We will implement **Partition-Based Routing** and isolate the async thread pool.

**Step 1: Assign Dedicated Partitions per Instance**
Remove the random group ID and explicitly assign a partition to the container. You can pass the partition number as an environment variable (e.g., `REPLY_PARTITION_ID=0` for Instance 1, `REPLY_PARTITION_ID=1` for Instance 2).

```java
@Value("${reply.partition.id:0}")
private int replyPartitionId;

@Bean("repliesContainer")
public KafkaMessageListenerContainer<String, String> repliesContainer(ConsumerFactory<String, String> cf) {
    ContainerProperties props = new ContainerProperties();
    // Assign exactly to this instance's partition
    TopicPartitionOffset[] offsets = Stream.concat(
            Arrays.stream(vocherReplyTopics),
            Arrays.stream(voucherUserRecordReplyTopics)
    ).map(topic -> new TopicPartitionOffset(topic, replyPartitionId))
     .toArray(TopicPartitionOffset[]::new);
     
    props.setTopicPartitions(offsets);
    // Group ID is no longer needed since we manually assign partitions
    
    KafkaMessageListenerContainer<String,String> container = new KafkaMessageListenerContainer<>(cf, props);
    container.setAutoStartup(true);
    return container;
}

```

**Step 2: Inject the Reply Partition into the Request**
When sending the original request from your template, inject the partition ID so the downstream service knows where to reply.

```java
// Inside your service class making the request
ProducerRecord<String, String> record = new ProducerRecord<>(requestTopic, payload);
record.headers().add(new RecordHeader(KafkaHeaders.REPLY_TOPIC, replyTopic.getBytes()));
// Tell downstream service which partition to reply to
record.headers().add(new RecordHeader(KafkaHeaders.REPLY_PARTITION, String.valueOf(replyPartitionId).getBytes())); 

RequestReplyFuture<String, String, String> future = replyingKafkaTemplate.sendAndReceive(record);

```

**Step 3: Route the Reply (Downstream Service)**
In the downstream service, stop hardcoding partition `0`. Extract the incoming `REPLY_PARTITION` and set it as the outgoing `PARTITION`.

```java
// Downstream Service code building the reply
byte[] replyPartitionBytes = incomingRecord.headers().lastHeader(KafkaHeaders.REPLY_PARTITION).value();
int targetPartition = Integer.parseInt(new String(replyPartitionBytes));

Message<String> replyMessage = MessageBuilder.withPayload(responsePayload)
    .setHeader(KafkaHeaders.TOPIC, incomingRecord.headers().lastHeader(KafkaHeaders.REPLY_TOPIC).value())
    .setHeader(KafkaHeaders.CORRELATION_ID, incomingRecord.headers().lastHeader(KafkaHeaders.CORRELATION_ID).value())
    .setHeader(KafkaHeaders.PARTITION, targetPartition) // Routes directly to the waiting instance
    .build();

kafkaTemplate.send(replyMessage);

```

**Step 4: Secure the Thread Pool**
Define a custom executor and pass it to your async call to prevent `commonPool()` starvation.

```java
@Bean(name = "kafkaAsyncExecutor")
public Executor taskExecutor() {
    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    executor.setCorePoolSize(10);
    executor.setMaxPoolSize(50);
    executor.setQueueCapacity(100);
    executor.setThreadNamePrefix("KafkaAsync-");
    executor.initialize();
    return executor;
}

// In your service:
CompletableFuture.runAsync(() -> {
    // Kafka sendAndReceive logic
}, kafkaAsyncExecutor);

```

---

### 3️⃣ Brief Notes: Synchronous Kafka Architecture

Here is the deep-dive summary of the architecture we covered:

* **⚙️ Internal Mechanics:** * `ReplyingKafkaTemplate` relies on a `Correlation ID` injected into the Kafka header.
* The sending application stores an uncompleted `CompletableFuture` in a local concurrent map mapped to that ID.
* A dedicated listener container polls the reply topic, extracts the ID, looks it up in the map, and completes the future.


* **🏢 Multi-Instance Challenge:** * *Broadcast (Flawed):* Using random `group.id` per instance causes all instances to read all replies. Instances that did not make the request will log warnings and discard the message. Hardcoding a single partition bottlenecks the cluster.
* *Partition-Based Routing (Robust):* Each application instance is explicitly assigned a single, dedicated partition on the reply topic. The requesting app sends its partition ID in the `KafkaHeaders.REPLY_PARTITION` header. The downstream service routes the reply specifically to that partition.


* **🧵 Concurrency Pitfalls:** * Using `CompletableFuture.runAsync()` without a custom executor defaults to the `ForkJoinPool.commonPool()`.
* Under heavy load, waiting for Kafka replies blocks these threads, causing **Thread Starvation** and freezing the entire JVM. Always supply a dedicated `ThreadPoolTaskExecutor`.


* **🛡️ Robustness & Failure Handling:**
* Always configure a timeout on the `ReplyingKafkaTemplate` to clear out lost messages and prevent permanent memory leaks.
* If the downstream service encounters a business or system error, it must catch the exception and actively send an error reply back (using standard wrappers or `KafkaHeaders.EXCEPTION_MESSAGE`). This allows the requester to fail fast instead of waiting for the timeout clock to expire.

