# Kafka Interview Question Bank

Use this file as a drill sheet.

For each question, try to answer in under 90 seconds first. Then go deeper only if asked.

## Section 1: Core Fundamentals

1. What problem does Kafka solve better than direct synchronous service-to-service calls?
2. What is the difference between a topic and a partition?
3. What is an offset?
4. Why does Kafka use partitions?
5. How does Kafka preserve ordering?
6. What is a consumer group?
7. Can two consumers in the same group read the same partition at the same time?
8. What is consumer lag?
9. What is replication factor?
10. What is ISR?
11. What is a leader replica?
12. What happens if a broker that is the leader for a partition goes down?
13. What is the difference between `acks=0`, `acks=1`, and `acks=all`?
14. Why is manual offset commit often preferred in important consumers?
15. What is the difference between at-most-once and at-least-once?

## Section 2: Producer Deep Dive

16. How does a producer decide which partition a record goes to?
17. Why would you use a message key?
18. What happens if you choose a bad partition key?
19. What is producer batching and why does it matter?
20. Why use compression in Kafka producers?
21. What does idempotent producer mode protect against?
22. Does an idempotent producer eliminate all duplicates in a business workflow?
23. What are Kafka transactions and when would you use them?
24. What tradeoffs come with enabling stronger durability on the producer side?
25. How would you publish high-value events differently from low-value telemetry?

## Section 3: Consumer Deep Dive

26. What happens if a consumer crashes after processing a record but before committing its offset?
27. How do you build an idempotent consumer?
28. What is a rebalance?
29. Why can rebalances hurt performance?
30. What is the difference between auto-commit and manual commit?
31. What should happen first: database write or offset commit?
32. How would you process records in batches safely?
33. How do you design retries for transient failures?
34. When would you send a message to DLQ?
35. Why is DLQ not a full solution by itself?

## Section 4: Topic And Schema Design

36. How do you decide whether to create one topic or multiple topics?
37. How do you choose the number of partitions?
38. What is the impact of increasing partition count later?
39. How do you evolve Kafka event schemas safely?
40. Why should event contracts be versioned?
41. What is schema compatibility and why does it matter?
42. What is the risk of stuffing unrelated event types into one topic?
43. When would you use log compaction?
44. When would you prefer time-based retention?
45. How do you decide whether a topic should be compacted, retained, or both?

## Section 5: Reliability And Consistency

46. What delivery guarantee does Kafka provide by default?
47. What does exactly-once actually mean in Kafka?
48. Why is exactly-once often misunderstood in interviews?
49. How do you avoid duplicate side effects in downstream systems?
50. What is the outbox pattern?
51. Why is the outbox pattern useful when publishing from a relational or document database update flow?
52. What problems can happen if a service writes to the database and Kafka separately without an outbox?
53. What is the difference between Kafka durability and end-to-end business consistency?
54. How would you replay events safely after a consumer bug fix?
55. What risks come with replaying historical events?

## Section 6: Performance And Scaling

56. What are the main levers for increasing producer throughput?
57. What are the main levers for increasing consumer throughput?
58. Why can adding more consumers stop helping after a point?
59. How do hot partitions happen?
60. How do you detect partition skew?
61. Why can Kafka be healthy while the overall pipeline is still slow?
62. How do downstream databases affect Kafka consumer design?
63. What is the tradeoff between throughput and latency in batch tuning?
64. When is compression worth the CPU cost?
65. How would you handle sudden traffic spikes?

## Section 7: Monitoring And Incident Response

66. What metrics would you monitor first in Kafka?
67. What does growing consumer lag usually indicate?
68. What does a spike in under-replicated partitions indicate?
69. What would you do if DLQ volume suddenly increases?
70. How would you investigate a slow consumer?
71. How would you investigate a producer timeout issue?
72. What would you check if records appear delayed but not lost?
73. How do you detect frequent rebalances?
74. What would you put in a Kafka on-call runbook?
75. How would you recover from poison messages causing retry storms?

## Section 8: System Design Questions

76. Design an event-driven analytics pipeline for an ecommerce platform.
77. Design a Kafka-based order-status workflow where event ordering matters.
78. Design a recommendation feature that consumes user behavior from Kafka.
79. Design a cross-service notification platform using Kafka.
80. Design a replay-safe consumer for payment-related events.
81. Design a multi-tenant Kafka topology for thousands of customers.
82. How would you design Kafka usage across regions?
83. How would you isolate low-priority analytics traffic from high-priority financial events?
84. When would you separate topics by domain versus by consumer need?
85. How would you design for both real-time processing and historical replay?

## Section 9: Architecture Tradeoffs

86. When would you choose Kafka over RabbitMQ?
87. When would you choose Kafka over SQS?
88. When would you choose a database outbox plus Kafka over synchronous APIs?
89. When would Kafka be overkill?
90. What are the operational costs of Kafka that teams underestimate?
91. Why is schema governance important in Kafka-heavy organizations?
92. How do you balance topic simplicity against consumer flexibility?
93. When would you use one consumer service versus separate consumer services?
94. How do you decide whether a consumer should do heavy processing or just materialize a read model?
95. How do you think about retention cost versus replay value?

## Section 10: Senior Ownership Questions

96. Tell me about a failure mode you designed around in Kafka.
97. Tell me about a tradeoff you made between reliability and latency.
98. How would you convince a team not to overuse Kafka?
99. How would you roll out a breaking event-schema change safely?
100. What is the hardest part of operating Kafka in production?
101. How would you mentor a mid-level engineer implementing their first consumer?
102. What would you review first in a pull request adding a new Kafka producer?
103. What would you review first in a pull request adding a new Kafka consumer?
104. How would you explain at-least-once semantics to a product manager?
105. What improvements would you prioritize in a Kafka platform over the next 6 months?

## Section 11: Scenario-Based Practice

### Scenario A

A consumer writes to MongoDB and then commits offsets. MongoDB latency spikes and lag grows.

Questions:

1. What do you check first?
2. Would you scale consumers, MongoDB, or both?
3. What temporary mitigation would you consider?

### Scenario B

Your producer accidentally changes an event field name and consumers start failing validation.

Questions:

1. How do you contain the blast radius?
2. What is the role of DLQ?
3. How do you prevent this class of issue long term?

### Scenario C

One tenant generates 70 percent of all traffic and all its records map to the same partition.

Questions:

1. Why is this a problem?
2. How do you confirm it?
3. How would you redesign the key strategy?

### Scenario D

Checkout succeeded in the database, but the purchase event was never published to Kafka.

Questions:

1. What consistency gap is this?
2. What design pattern fixes it?
3. What are the tradeoffs of that pattern?

## Section 12: What Strong Answers Usually Include

A strong Kafka answer usually includes some of these ideas:

- ordering is per partition
- consumer groups scale by partition count
- at-least-once means idempotency matters
- retries need bounds
- DLQ is for containment, not correctness
- schema changes need compatibility and rollout planning
- sink bottlenecks matter as much as broker throughput
- observability needs lag, retries, rebalance health, and storage signals
- outbox helps bridge local persistence and async publish reliability

## Final Drill Mode

If you want a high-pressure prep session, answer these 10 without notes:

1. What is the difference between idempotent producer and idempotent consumer?
2. Why is ordering only partition-scoped?
3. What is ISR and why does it matter?
4. What is consumer lag and how do you react when it grows?
5. Why is exactly-once not a magic answer?
6. When do you need an outbox?
7. What problem does DLQ solve?
8. How do you pick a partition key?
9. How do you replay events safely?
10. What would you improve first in a production Kafka platform?
