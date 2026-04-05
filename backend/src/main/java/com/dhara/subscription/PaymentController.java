package com.dhara.subscription;

import com.dhara.common.ApiResponse;
import com.dhara.subscription.dto.PaymentInitRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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
            @RequestBody PaymentInitRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String gatewayUrl = sslCommerzService.initPayment(
                userDetails.getUsername(),
                request.planId(),
                request.currency()
        );
        return ResponseEntity.ok(ApiResponse.ok(new PaymentInitResponse(gatewayUrl)));
    }

    public record PaymentInitResponse(String gatewayUrl) {}
}
