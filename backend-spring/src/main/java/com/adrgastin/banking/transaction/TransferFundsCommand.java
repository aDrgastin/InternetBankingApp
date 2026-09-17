package com.adrgastin.banking.transaction;

import com.adrgastin.banking.validation.Iban;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record TransferFundsCommand(
        @NotNull(message = "Sender ID is required") Integer fromAccountId,
        @NotBlank(message = "Recipient IBAN is required") @Iban String toIban,
        @NotNull(message = "Amount is required") @DecimalMin(value = "0.01", message = "Amount must be positive") BigDecimal amount,
        String description
) { }
