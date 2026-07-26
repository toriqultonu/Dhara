package com.dhara.subscription;

import com.dhara.entity.SubscriptionPlan;
import com.dhara.entity.User;
import com.dhara.entity.UserSubscription;
import com.dhara.repository.SubscriptionPlanRepository;
import com.dhara.repository.UserSubscriptionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SubscriptionServiceTest {

    private static final Long USER_ID = 42L;

    @Mock
    private SubscriptionPlanRepository planRepository;

    @Mock
    private UserSubscriptionRepository subscriptionRepository;

    @InjectMocks
    private SubscriptionService subscriptionService;

    private UserSubscription subscription(String planName, Instant expiresAt) {
        SubscriptionPlan plan = new SubscriptionPlan();
        plan.setName(planName);

        User user = new User();
        user.setId(USER_ID);

        UserSubscription sub = new UserSubscription();
        sub.setUser(user);
        sub.setPlan(plan);
        sub.setStatus("ACTIVE");
        sub.setExpiresAt(expiresAt);
        return sub;
    }

    @Test
    void getUserTier_activeNonExpiredSubscription_returnsPlanName() {
        when(subscriptionRepository.findByUserIdAndStatus(USER_ID, "ACTIVE"))
                .thenReturn(Optional.of(subscription("PROFESSIONAL",
                        Instant.now().plus(10, ChronoUnit.DAYS))));

        assertThat(subscriptionService.getUserTier(USER_ID)).isEqualTo("PROFESSIONAL");
    }

    @Test
    void getUserTier_subscriptionWithoutExpiry_returnsPlanName() {
        when(subscriptionRepository.findByUserIdAndStatus(USER_ID, "ACTIVE"))
                .thenReturn(Optional.of(subscription("STUDENT", null)));

        assertThat(subscriptionService.getUserTier(USER_ID)).isEqualTo("STUDENT");
    }

    @Test
    void getUserTier_expiredSubscription_returnsFree() {
        when(subscriptionRepository.findByUserIdAndStatus(USER_ID, "ACTIVE"))
                .thenReturn(Optional.of(subscription("PROFESSIONAL",
                        Instant.now().minus(1, ChronoUnit.DAYS))));

        assertThat(subscriptionService.getUserTier(USER_ID)).isEqualTo("FREE");
    }

    @Test
    void getUserTier_noSubscription_returnsFree() {
        when(subscriptionRepository.findByUserIdAndStatus(USER_ID, "ACTIVE"))
                .thenReturn(Optional.empty());

        assertThat(subscriptionService.getUserTier(USER_ID)).isEqualTo("FREE");
    }
}
