package com.dhara.repository;

import com.dhara.entity.Judgment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JudgmentRepository extends JpaRepository<Judgment, Long> {
    Page<Judgment> findByStatus(String status, Pageable pageable);
    Page<Judgment> findByCourt(String court, Pageable pageable);
}
