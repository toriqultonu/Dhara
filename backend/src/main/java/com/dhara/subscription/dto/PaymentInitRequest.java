package com.dhara.subscription.dto;

public record PaymentInitRequest(
        Long planId,
        String currency
) {
    public PaymentInitRequest {
        if (currency == null || currency.isBlank()) {
            currency = "BDT";
        }
    }
}
