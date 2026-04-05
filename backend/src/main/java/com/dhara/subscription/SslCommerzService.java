package com.dhara.subscription;

import com.dhara.common.ResourceNotFoundException;
import com.dhara.entity.SubscriptionPlan;
import com.dhara.entity.User;
import com.dhara.entity.UserSubscription;
import com.dhara.repository.SubscriptionPlanRepository;
import com.dhara.repository.UserRepository;
import com.dhara.repository.UserSubscriptionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Service
public class SslCommerzService {

    private static final Logger log = LoggerFactory.getLogger(SslCommerzService.class);

    @Value("${sslcommerz.store-id:}")
    private String storeId;

    @Value("${sslcommerz.store-password:}")
    private String storePassword;

    @Value("${sslcommerz.base-url:https://sandbox.sslcommerz.com}")
    private String baseUrl;

    @Value("${app.base-url:http://localhost:8080}")
    private String appBaseUrl;

    private final UserRepository userRepository;
    private final SubscriptionPlanRepository planRepository;
    private final UserSubscriptionRepository subscriptionRepository;

    public SslCommerzService(
            UserRepository userRepository,
            SubscriptionPlanRepository planRepository,
            UserSubscriptionRepository subscriptionRepository
    ) {
        this.userRepository = userRepository;
        this.planRepository = planRepository;
        this.subscriptionRepository = subscriptionRepository;
    }

    public String initPayment(String userEmail, Long planId, String currency) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", userEmail));
        SubscriptionPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Plan", planId));

        String transactionId = "DHARA-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        log.info("Initiating SSLCommerz payment: txn={}, user={}, plan={}, amount={}",
                transactionId, user.getEmail(), plan.getName(), plan.getPriceBdt());

        // TODO: Make actual HTTP call to SSLCommerz API
        // POST ${baseUrl}/gwprocess/v4/api.php
        // Parameters:
        //   store_id, store_passwd, total_amount, currency, tran_id,
        //   success_url, fail_url, cancel_url, cus_name, cus_email, etc.
        //
        // For now, return a placeholder URL
        return baseUrl + "/payment?tran_id=" + transactionId;
    }

    @Transactional
    public boolean validateAndActivate(Map<String, String> params) {
        String transactionId = params.get("tran_id");
        String status = params.get("status");
        String valId = params.get("val_id");

        log.info("SSLCommerz callback: txn={}, status={}", transactionId, status);

        if (!"VALID".equals(status)) {
            log.warn("Payment not valid: txn={}, status={}", transactionId, status);
            return false;
        }

        // TODO: Validate with SSLCommerz validation API
        // GET ${baseUrl}/validator/api/validationserverAPI.php?val_id=${valId}&store_id=&store_passwd=&format=json

        // TODO: Look up pending subscription by transaction ID and activate it
        return true;
    }
}
