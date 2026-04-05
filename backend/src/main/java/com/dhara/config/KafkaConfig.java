package com.dhara.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;

@Configuration
@EnableKafka
public class KafkaConfig {
    // Kafka producer is auto-configured by Spring Boot via application.yml
    // Compression type is set to lz4 (not snappy) for Alpine compatibility
}
