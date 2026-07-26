package com.dhara.subscription;

import com.dhara.common.ResourceNotFoundException;
import com.dhara.entity.SubscriptionPlan;
import com.dhara.entity.User;
import com.dhara.entity.UserSubscription;
import com.dhara.repository.SubscriptionPlanRepository;
import com.dhara.repository.UserRepository;
import com.dhara.repository.UserSubscriptionRepository;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;

@Service
public class SslCommerzService {

    private static final Logger log = LoggerFactory.getLogger(SslCommerzService.class);

    private static final String SANDBOX_BASE_URL = "https://sandbox.sslcommerz.com";
    private static final String PROD_BASE_URL = "https://securepay.sslcommerz.com";

    private final String storeId;
    private final String storePassword;
    private final String gatewayBaseUrl;
    private final String appBaseUrl;
    private final RestClient restClient;

    private final UserRepository userRepository;
    private final SubscriptionPlanRepository planRepository;
    private final UserSubscriptionRepository subscriptionRepository;

    public SslCommerzService(
            @Value("${dhara.sslcommerz.store-id:}") String storeId,
            @Value("${dhara.sslcommerz.store-password:}") String storePassword,
            @Value("${dhara.sslcommerz.is-sandbox:true}") boolean isSandbox,
            @Value("${dhara.app.base-url:http://localhost:8080}") String appBaseUrl,
            RestClient.Builder restClientBuilder,
            UserRepository userRepository,
            SubscriptionPlanRepository planRepository,
            UserSubscriptionRepository subscriptionRepository
    ) {
        this.storeId = storeId;
        this.storePassword = storePassword;
        this.gatewayBaseUrl = isSandbox ? SANDBOX_BASE_URL : PROD_BASE_URL;
        this.appBaseUrl = appBaseUrl;
        this.restClient = restClientBuilder.baseUrl(this.gatewayBaseUrl).build();
        this.userRepository = userRepository;
        this.planRepository = planRepository;
        this.subscriptionRepository = subscriptionRepository;
    }

    /**
     * Initiates an SSLCommerz payment session for the given plan. Creates a PENDING
     * subscription keyed by transaction ID and returns the hosted gateway page URL.
     */
    @Transactional
    public String initPayment(Long userId, Long planId, String currency) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        SubscriptionPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Plan", planId));

        BigDecimal amount = plan.getPriceBdt();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Plan " + plan.getName() + " does not require payment");
        }

        String transactionId = "DHARA-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        log.info("Initiating SSLCommerz payment: txn={}, user={}, plan={}, amount={}",
                transactionId, user.getEmail(), plan.getName(), amount);

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("store_id", storeId);
        form.add("store_passwd", storePassword);
        form.add("total_amount", amount.toPlainString());
        form.add("currency", currency != null && !currency.isBlank() ? currency : "BDT");
        form.add("tran_id", transactionId);
        form.add("success_url", appBaseUrl + "/api/webhooks/sslcommerz/success");
        form.add("fail_url", appBaseUrl + "/api/webhooks/sslcommerz/fail");
        form.add("cancel_url", appBaseUrl + "/api/webhooks/sslcommerz/cancel");
        form.add("ipn_url", appBaseUrl + "/api/webhooks/sslcommerz/ipn");
        form.add("cus_name", user.getName());
        form.add("cus_email", user.getEmail());
        form.add("cus_add1", "Dhaka");
        form.add("cus_city", "Dhaka");
        form.add("cus_country", "Bangladesh");
        form.add("cus_phone", "01700000000");
        form.add("shipping_method", "NO");
        form.add("product_name", "Dhara " + plan.getName() + " Subscription");
        form.add("product_category", "subscription");
        form.add("product_profile", "non-physical-goods");

        SslInitResponse response;
        try {
            response = restClient.post()
                    .uri("/gwprocess/v4/api.php")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(SslInitResponse.class);
        } catch (Exception e) {
            log.error("SSLCommerz init call failed: txn={}", transactionId, e);
            throw new IllegalStateException("Payment gateway is unavailable. Please try again later.");
        }

        if (response == null || !"SUCCESS".equalsIgnoreCase(response.status())
                || response.gatewayPageUrl() == null || response.gatewayPageUrl().isBlank()) {
            String reason = response != null ? response.failedReason() : "empty response";
            log.error("SSLCommerz init rejected: txn={}, reason={}", transactionId, reason);
            throw new IllegalStateException("Payment initiation failed: "
                    + (reason != null ? reason : "unknown error"));
        }

        UserSubscription pending = new UserSubscription();
        pending.setUser(user);
        pending.setPlan(plan);
        pending.setStatus("PENDING");
        pending.setTransactionId(transactionId);
        subscriptionRepository.save(pending);

        return response.gatewayPageUrl();
    }

    /**
     * Validates a payment callback against the SSLCommerz validation API and, when
     * valid, activates the pending subscription tied to the transaction ID.
     */
    @Transactional
    public boolean validateAndActivate(Map<String, String> params) {
        String transactionId = params.get("tran_id");
        String status = params.get("status");
        String valId = params.get("val_id");

        log.info("SSLCommerz callback: txn={}, status={}", transactionId, status);

        if (transactionId == null || valId == null) {
            log.warn("SSLCommerz callback missing tran_id or val_id");
            return false;
        }

        if (!"VALID".equals(status) && !"VALIDATED".equals(status)) {
            log.warn("Payment not valid: txn={}, status={}", transactionId, status);
            return false;
        }

        SslValidationResponse validation;
        try {
            validation = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/validator/api/validationserverAPI.php")
                            .queryParam("val_id", valId)
                            .queryParam("store_id", storeId)
                            .queryParam("store_passwd", storePassword)
                            .queryParam("format", "json")
                            .build())
                    .retrieve()
                    .body(SslValidationResponse.class);
        } catch (Exception e) {
            log.error("SSLCommerz validation call failed: txn={}", transactionId, e);
            return false;
        }

        if (validation == null
                || (!"VALID".equalsIgnoreCase(validation.status())
                        && !"VALIDATED".equalsIgnoreCase(validation.status()))) {
            log.warn("SSLCommerz server validation failed: txn={}, status={}",
                    transactionId, validation != null ? validation.status() : "null");
            return false;
        }

        if (validation.tranId() != null && !transactionId.equals(validation.tranId())) {
            log.warn("Transaction ID mismatch: callback={}, validator={}",
                    transactionId, validation.tranId());
            return false;
        }

        UserSubscription subscription = subscriptionRepository
                .findByTransactionId(transactionId)
                .orElse(null);
        if (subscription == null) {
            log.warn("No pending subscription found for txn={}", transactionId);
            return false;
        }

        if ("ACTIVE".equals(subscription.getStatus())) {
            log.info("Subscription already active for txn={} (duplicate IPN)", transactionId);
            return true;
        }

        // Expire any previous active subscription so only one is active per user.
        subscriptionRepository
                .findAllByUserIdAndStatus(subscription.getUser().getId(), "ACTIVE")
                .forEach(existing -> existing.setStatus("EXPIRED"));

        int durationDays = subscription.getPlan().getDurationDays() != null
                ? subscription.getPlan().getDurationDays() : 30;
        Instant now = Instant.now();
        subscription.setStatus("ACTIVE");
        subscription.setStartedAt(now);
        subscription.setExpiresAt(now.plus(durationDays, ChronoUnit.DAYS));
        subscriptionRepository.save(subscription);

        log.info("Subscription activated: txn={}, user={}, plan={}, expires={}",
                transactionId, subscription.getUser().getId(),
                subscription.getPlan().getName(), subscription.getExpiresAt());
        return true;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record SslInitResponse(
            @JsonProperty("status") String status,
            @JsonProperty("failedreason") String failedReason,
            @JsonProperty("GatewayPageURL") String gatewayPageUrl,
            @JsonProperty("sessionkey") String sessionKey
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record SslValidationResponse(
            @JsonProperty("status") String status,
            @JsonProperty("tran_id") String tranId,
            @JsonProperty("val_id") String valId,
            @JsonProperty("amount") String amount,
            @JsonProperty("currency") String currency
    ) {}
}
