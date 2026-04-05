package com.dhara.repository;

import com.dhara.entity.Statute;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface StatuteRepository extends JpaRepository<Statute, Long> {
    Page<Statute> findByStatus(String status, Pageable pageable);

    @Query("SELECT s FROM Statute s WHERE LOWER(s.titleEn) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(s.titleBn) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Statute> searchByTitle(String query, Pageable pageable);

    Page<Statute> findByCategory(String category, Pageable pageable);
}
