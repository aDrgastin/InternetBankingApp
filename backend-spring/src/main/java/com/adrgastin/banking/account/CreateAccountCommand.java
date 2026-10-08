package com.adrgastin.banking.account;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateAccountCommand(
        @NotNull(message = "Owner is required") Integer ownerId,
        @NotBlank(message = "Account type is required") String type
) { }
