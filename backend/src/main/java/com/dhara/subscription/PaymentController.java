package com.dhara.subscription;

import com.dhara.common.ApiResponse;
import com.dhara.subscription.dto.PaymentInitRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final SslCommerzService sslCommerzService;

    public PaymentController(SslCommerzService sslCommerzService) {
        this.sslCommerzService = sslCommerzService;
    }

    @PostMapping("/init")
    public ResponseEntity<ApiResponse<PaymentInitResponse>> initPayment(
            @RequestBody PaymentInitRequest request, Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        String gatewayUrl = sslCommerzService.initPayment(
                userId,
                request.planId(),
                request.currency()
        );
        return ResponseEntity.ok(ApiResponse.ok(new PaymentInitResponse(gatewayUrl)));
    }

    public record PaymentInitResponse(String gatewayUrl) {}
}
