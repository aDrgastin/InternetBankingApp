package com.adrgastin.banking.account;

import jakarta.validation.constraints.NotNull;

public record UpdateAccountStatusCommand(
        @NotNull(message = "Account status is required") AccountStatus status
) { }
