package com.dhara.repository;

import com.dhara.entity.UsageLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UsageLogRepository extends JpaRepository<UsageLog, Long> {
    List<UsageLog> findByUserIdOrderByCreatedAtDesc(Long userId);
}
