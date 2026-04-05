package com.dhara.repository;

import com.dhara.entity.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {
    List<SubscriptionPlan> findByStatusOrderByPriceBdtAsc(String status);
}
