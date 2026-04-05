package com.dhara.entity;

import com.dhara.common.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "statutes")
@Getter @Setter @NoArgsConstructor
public class Statute extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "act_number", nullable = false, length = 100)
    private String actNumber;

    @Column(name = "title_en", nullable = false, length = 500)
    private String titleEn;

    @Column(name = "title_bn", length = 500)
    private String titleBn;

    @Column(nullable = false)
    private Integer year;

    @Column(length = 100)
    private String category;

    @Column(length = 20)
    private String status = "ACTIVE";

    @Column(name = "effective_date")
    private LocalDate effectiveDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "repealed_by_id")
    private Statute repealedBy;

    @Column(name = "full_text", columnDefinition = "TEXT")
    private String fullText;

    @Column(name = "source_url", length = 500)
    private String sourceUrl;

    @OneToMany(mappedBy = "statute", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Section> sections = new ArrayList<>();
}
