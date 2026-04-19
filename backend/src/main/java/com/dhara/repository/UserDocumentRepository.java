package com.dhara.repository;

import com.dhara.entity.UserDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserDocumentRepository extends JpaRepository<UserDocument, Long> {

    Page<UserDocument> findByUserId(Long userId, Pageable pageable);

    Page<UserDocument> findByUserIdAndStatus(Long userId, String status, Pageable pageable);

    Page<UserDocument> findByUserIdAndCategory(Long userId, String category, Pageable pageable);

    @Query("SELECT d FROM UserDocument d WHERE d.user.id = :userId " +
           "AND (:status IS NULL OR d.status = :status) " +
           "AND (:category IS NULL OR d.category = :category) " +
           "AND (:search IS NULL OR LOWER(d.title) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<UserDocument> findByUserIdWithFilters(
            @Param("userId") Long userId,
            @Param("status") String status,
            @Param("category") String category,
            @Param("search") String search,
            Pageable pageable);

    long countByUserIdAndStatus(Long userId, String status);

    long countByUserIdAndShared(Long userId, boolean shared);

    long countByUserId(Long userId);
}
