package com.adrgastin.banking.card;

import jakarta.validation.constraints.NotNull;

public record CreateCardCommand(
        @NotNull(message = "Account ID is required") Integer accountId,
        @NotNull(message = "Card type is required") CardType type
) { }
