package com.dhara.repository;

import com.dhara.entity.AnalysisSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AnalysisSessionRepository extends JpaRepository<AnalysisSession, String> {

    Optional<AnalysisSession> findByIdAndUserId(String id, Long userId);
}
