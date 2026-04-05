package com.dhara.subscription;

import com.dhara.common.ResourceNotFoundException;
import com.dhara.entity.SubscriptionPlan;
import com.dhara.entity.UserSubscription;
import com.dhara.repository.SubscriptionPlanRepository;
import com.dhara.repository.UserSubscriptionRepository;
import com.dhara.subscription.dto.PlanResponse;
import com.dhara.subscription.dto.SubscriptionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionPlanRepository planRepository;
    private final UserSubscriptionRepository subscriptionRepository;

    @Transactional(readOnly = true)
    public List<PlanResponse> getAllPlans() {
        return planRepository.findByStatusOrderByPriceBdtAsc("ACTIVE")
                .stream().map(PlanResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public SubscriptionResponse getActiveSubscription(Long userId) {
        UserSubscription sub = subscriptionRepository.findByUserIdAndStatus(userId, "ACTIVE")
                .orElseThrow(() -> new ResourceNotFoundException("Subscription", userId));
        return SubscriptionResponse.from(sub);
    }
}
