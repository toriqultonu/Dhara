package com.dhara.subscription;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/webhooks/sslcommerz")
public class SslCommerzWebhookController {

    private static final Logger log = LoggerFactory.getLogger(SslCommerzWebhookController.class);
    private final SslCommerzService sslCommerzService;

    public SslCommerzWebhookController(SslCommerzService sslCommerzService) {
        this.sslCommerzService = sslCommerzService;
    }

    @PostMapping("/success")
    public ResponseEntity<String> paymentSuccess(@RequestParam Map<String, String> params) {
        log.info("SSLCommerz success callback received: tran_id={}", params.get("tran_id"));
        boolean activated = sslCommerzService.validateAndActivate(params);
        if (activated) {
            return ResponseEntity.ok("Payment successful. Subscription activated.");
        }
        return ResponseEntity.badRequest().body("Payment validation failed.");
    }

    @PostMapping("/fail")
    public ResponseEntity<String> paymentFail(@RequestParam Map<String, String> params) {
        log.warn("SSLCommerz payment failed: tran_id={}", params.get("tran_id"));
        return ResponseEntity.ok("Payment failed.");
    }

    @PostMapping("/cancel")
    public ResponseEntity<String> paymentCancel(@RequestParam Map<String, String> params) {
        log.info("SSLCommerz payment cancelled: tran_id={}", params.get("tran_id"));
        return ResponseEntity.ok("Payment cancelled.");
    }

    @PostMapping("/ipn")
    public ResponseEntity<String> ipnListener(@RequestParam Map<String, String> params) {
        log.info("SSLCommerz IPN received: tran_id={}, status={}", params.get("tran_id"), params.get("status"));
        sslCommerzService.validateAndActivate(params);
        return ResponseEntity.ok("IPN received.");
    }
}
