package com.adrgastin.banking.account;

import jakarta.validation.constraints.NotNull;

public record CreateAccountCommand(
        @NotNull(message = "Account type is required") AccountType type
) { }
