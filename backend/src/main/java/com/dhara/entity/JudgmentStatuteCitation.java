package com.dhara.entity;

import com.dhara.common.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "judgment_statute_citations")
@Getter @Setter @NoArgsConstructor
public class JudgmentStatuteCitation extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "judgment_id", nullable = false)
    private Judgment judgment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "statute_id", nullable = false)
    private Statute statute;

    @Column(name = "section_number", length = 50)
    private String sectionNumber;

    @Column(columnDefinition = "TEXT")
    private String context;
}
