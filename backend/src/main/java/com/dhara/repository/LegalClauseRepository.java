package com.dhara.repository;

import com.dhara.entity.LegalClause;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LegalClauseRepository extends JpaRepository<LegalClause, Long> {

    List<LegalClause> findByStatusOrderByTitleAsc(String status);

    List<LegalClause> findByStatusAndCategoryOrderByTitleAsc(String status, String category);
}
