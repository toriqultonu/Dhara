package com.dhara.entity;

import com.dhara.common.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "subscription_plans")
@Getter @Setter @NoArgsConstructor
public class SubscriptionPlan extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Column(name = "display_name_en", length = 100)
    private String displayNameEn;

    @Column(name = "display_name_bn", length = 100)
    private String displayNameBn;

    @Column(name = "price_bdt", precision = 10, scale = 2)
    private BigDecimal priceBdt;

    @Column(name = "ai_queries_per_day")
    private Integer aiQueriesPerDay;

    @Column(columnDefinition = "TEXT")
    private String features;

    @Column(length = 20)
    private String status = "ACTIVE";
}
