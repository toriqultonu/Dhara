package com.dhara.subscription;

import com.dhara.common.ApiResponse;
import com.dhara.subscription.dto.SubscriptionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping("/my-subscription")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> getMySubscription(Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.ok(ApiResponse.ok(subscriptionService.getActiveSubscription(userId)));
    }
}
