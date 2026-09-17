package com.adrgastin.banking.transaction;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record PosPayoutCommand(
        @NotNull(message = "Card number is required") String cardNumber,
        @NotNull(message = "Amount is required") @DecimalMin(value = "0.01", message = "Amount must be positive") BigDecimal amount,
        @NotBlank(message = "Merchant name is required") String merchantName,
        String merchantCategory
) { }
