package com.dhara.repository;

import com.dhara.entity.UserSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserSubscriptionRepository extends JpaRepository<UserSubscription, Long> {
    Optional<UserSubscription> findByUserIdAndStatus(Long userId, String status);

    Optional<UserSubscription> findByTransactionId(String transactionId);

    List<UserSubscription> findAllByUserIdAndStatus(Long userId, String status);
}
