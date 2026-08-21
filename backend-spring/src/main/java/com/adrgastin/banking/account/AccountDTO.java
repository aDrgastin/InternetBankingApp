package com.adrgastin.banking.account;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AccountDTO(
        Integer id,
        String iban,
        BigDecimal balance,
        AccountStatus status,
        AccountType type,
        LocalDateTime createdAt,
        Integer userId
) { }
