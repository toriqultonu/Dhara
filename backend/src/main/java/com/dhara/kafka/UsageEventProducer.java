package com.dhara.kafka;

import com.dhara.common.Constants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class UsageEventProducer {

    private final KafkaTemplate<String, UsageEvent> kafkaTemplate;

    public void send(UsageEvent event) {
        kafkaTemplate.send(Constants.KAFKA_USAGE_TOPIC, event.userId().toString(), event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("Failed to send usage event", ex);
                    }
                });
    }
}
