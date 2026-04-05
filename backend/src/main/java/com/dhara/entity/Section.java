package com.dhara.entity;

import com.dhara.common.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "sections")
@Getter @Setter @NoArgsConstructor
public class Section extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "statute_id", nullable = false)
    private Statute statute;

    @Column(name = "section_number", nullable = false, length = 50)
    private String sectionNumber;

    @Column(name = "title_en", length = 500)
    private String titleEn;

    @Column(name = "title_bn", length = 500)
    private String titleBn;

    @Column(name = "content_en", columnDefinition = "TEXT")
    private String contentEn;

    @Column(name = "content_bn", columnDefinition = "TEXT")
    private String contentBn;

    @Column(length = 20)
    private String status = "ACTIVE";
}
