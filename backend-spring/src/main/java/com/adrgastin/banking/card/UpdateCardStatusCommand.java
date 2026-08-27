package com.adrgastin.banking.card;

import jakarta.validation.constraints.NotNull;

public record UpdateCardStatusCommand(
        @NotNull(message = "Card status is required") CardStatus status
) { }
