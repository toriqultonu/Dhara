package com.dhara.entity;

import com.dhara.common.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "judgment_judgment_citations")
@Getter @Setter @NoArgsConstructor
public class JudgmentJudgmentCitation extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "citing_judgment_id", nullable = false)
    private Judgment citingJudgment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cited_judgment_id", nullable = false)
    private Judgment citedJudgment;

    @Column(columnDefinition = "TEXT")
    private String context;
}
