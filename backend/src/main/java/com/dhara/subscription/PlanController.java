package com.dhara.subscription;

import com.dhara.common.ApiResponse;
import com.dhara.subscription.dto.PlanResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/plans")
@RequiredArgsConstructor
public class PlanController {

    private final SubscriptionService subscriptionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PlanResponse>>> getPlans() {
        return ResponseEntity.ok(ApiResponse.ok(subscriptionService.getAllPlans()));
    }
}
