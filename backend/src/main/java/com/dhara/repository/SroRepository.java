package com.dhara.repository;

import com.dhara.entity.Sro;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SroRepository extends JpaRepository<Sro, Long> {
    Page<Sro> findByStatus(String status, Pageable pageable);
}
