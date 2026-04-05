package com.dhara.entity;

import com.dhara.common.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "judgments")
@Getter @Setter @NoArgsConstructor
public class Judgment extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "case_name", nullable = false, length = 500)
    private String caseName;

    @Column(nullable = false, length = 200)
    private String citation;

    @Column(length = 100)
    private String court;

    @Column(columnDefinition = "TEXT")
    private String bench;

    @Column(name = "judgment_date")
    private LocalDate judgmentDate;

    @Column(name = "headnotes_en", columnDefinition = "TEXT")
    private String headnotesEn;

    @Column(name = "headnotes_bn", columnDefinition = "TEXT")
    private String headnotesBn;

    @Column(name = "full_text", columnDefinition = "TEXT")
    private String fullText;

    @Column(name = "source_url", length = 500)
    private String sourceUrl;

    @Column(length = 20)
    private String status = "ACTIVE";
}
