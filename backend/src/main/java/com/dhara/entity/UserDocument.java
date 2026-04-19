package com.dhara.entity;

import com.dhara.common.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "user_documents")
@Getter @Setter @NoArgsConstructor
public class UserDocument extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(length = 50)
    private String category = "other";

    @Column(length = 20)
    private String status = "draft";

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(columnDefinition = "TEXT[]")
    private String[] tags;

    @Column(nullable = false)
    private Boolean shared = false;

    @Column(name = "share_url", length = 500)
    private String shareUrl;

    @Column(name = "share_permission", length = 20)
    private String sharePermission;

    @Column(name = "share_expires_at", columnDefinition = "TIMESTAMPTZ")
    private Instant shareExpiresAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id")
    private DocumentTemplate template;
}
