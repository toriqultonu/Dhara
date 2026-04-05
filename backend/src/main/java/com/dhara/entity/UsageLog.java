package com.dhara.entity;

import com.dhara.common.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "usage_log")
@Getter @Setter @NoArgsConstructor
public class UsageLog extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "action_type", nullable = false, length = 30)
    private String actionType;

    @Column(name = "query_text", columnDefinition = "TEXT")
    private String queryText;

    @Column(name = "tokens_used")
    private Integer tokensUsed;

    @Column(name = "llm_provider", length = 50)
    private String llmProvider;

    @Column(name = "cost_usd", precision = 10, scale = 6)
    private BigDecimal costUsd;
}
