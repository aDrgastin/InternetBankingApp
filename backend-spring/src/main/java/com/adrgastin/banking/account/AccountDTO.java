package com.adrgastin.banking.account;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AccountDTO(
        Integer id,
        String iban,
        BigDecimal balance,
        AccountStatus status,
        String type,
        LocalDateTime createdAt
) {
    public static AccountDTO from(Account account) {
        return new AccountDTO(account.getId(), account.getIban(), account.getBalance(), account.getStatus(), account.getAccountType().getName(), account.getCreatedAt());
    }
}
