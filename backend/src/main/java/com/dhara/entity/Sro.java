package com.dhara.entity;

import com.dhara.common.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "sros")
@Getter @Setter @NoArgsConstructor
public class Sro extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sro_number", nullable = false, length = 100)
    private String sroNumber;

    @Column(name = "title_en", length = 500)
    private String titleEn;

    @Column(name = "title_bn", length = 500)
    private String titleBn;

    @Column(name = "gazette_date")
    private LocalDate gazetteDate;

    @Column(name = "issuing_ministry", length = 200)
    private String issuingMinistry;

    @Column(name = "full_text", columnDefinition = "TEXT")
    private String fullText;

    @Column(name = "source_url", length = 500)
    private String sourceUrl;

    @Column(length = 20)
    private String status = "ACTIVE";
}
