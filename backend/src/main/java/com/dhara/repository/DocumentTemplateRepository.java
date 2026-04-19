package com.dhara.repository;

import com.dhara.entity.DocumentTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DocumentTemplateRepository extends JpaRepository<DocumentTemplate, Long> {

    List<DocumentTemplate> findByStatusOrderByPopularityDesc(String status);

    Page<DocumentTemplate> findByStatusAndCategory(String status, String category, Pageable pageable);

    @Query("SELECT t FROM DocumentTemplate t WHERE t.status = 'ACTIVE' " +
           "AND (:category IS NULL OR t.category = :category) " +
           "AND (:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')))" +
           "ORDER BY t.popularity DESC")
    Page<DocumentTemplate> findWithFilters(
            @Param("category") String category,
            @Param("search") String search,
            Pageable pageable);
}
