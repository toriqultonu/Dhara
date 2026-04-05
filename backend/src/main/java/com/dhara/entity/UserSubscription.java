package com.dhara.entity;

import com.dhara.common.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "user_subscriptions")
@Getter @Setter @NoArgsConstructor
public class UserSubscription extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private SubscriptionPlan plan;

    @Column(length = 20)
    private String status = "ACTIVE";

    @Column(name = "started_at", columnDefinition = "TIMESTAMPTZ")
    private Instant startedAt;

    @Column(name = "expires_at", columnDefinition = "TIMESTAMPTZ")
    private Instant expiresAt;
}
