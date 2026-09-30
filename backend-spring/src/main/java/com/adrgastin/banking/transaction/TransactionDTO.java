package com.adrgastin.banking.transaction;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransactionDTO(
        Integer id,
        String reference,
        String type,
        Integer fromAccount,
        String fromIban,
        Integer toAccount,
        String toIban,
        BigDecimal amount,
        TransactionStatus status,
        LocalDateTime timestamp,
        String description,
        TransactionDirection direction
) {
    public static TransactionDTO forUser(Transaction tx, Integer requestingUserId) {
        return new TransactionDTO(tx.getId(), tx.getReference(), tx.getType().getName(),
                tx.getFromAccount() != null ? tx.getFromAccount().getId() : null,
                tx.getFromAccount() != null ? tx.getFromAccount().getIban() : null,
                tx.getToAccount() != null ? tx.getToAccount().getId() : null,
                tx.getToAccount() != null ? tx.getToAccount().getIban() : null,
                tx.getAmount(), tx.getStatus(), tx.getTimestamp(), tx.getDescription(), resolveDirectionForUser(tx, requestingUserId));
    }

    public static TransactionDTO forAccount(Transaction tx, Integer accountId) {
        return new TransactionDTO(tx.getId(), tx.getReference(), tx.getType().getName(),
                tx.getFromAccount() != null ? tx.getFromAccount().getId() : null,
                tx.getFromAccount() != null ? tx.getFromAccount().getIban() : null,
                tx.getToAccount() != null ? tx.getToAccount().getId() : null,
                tx.getToAccount() != null ? tx.getToAccount().getIban() : null,
                tx.getAmount(), tx.getStatus(), tx.getTimestamp(), tx.getDescription(), resolveDirectionForAccount(tx, accountId));
    }

    private static TransactionDirection resolveDirectionForUser(Transaction tx, Integer userId) {
        String type = tx.getType().toString();
        if ("DEPOSIT".equals(type)) return TransactionDirection.CREDIT;
        else if ("WITHDRAWAL".equals(type) || "FEE".equals(type)) return TransactionDirection.DEBIT;

        boolean userOwnsFromAccount = tx.getFromAccount() != null
                && tx.getFromAccount().getUsers().stream().anyMatch(u -> u.getId().equals(userId));
        return userOwnsFromAccount ? TransactionDirection.DEBIT : TransactionDirection.CREDIT;
    }

    private static TransactionDirection resolveDirectionForAccount(Transaction tx, Integer accountId) {
        String type = tx.getType().toString();
        if ("DEPOSIT".equals(type)) return TransactionDirection.CREDIT;
        else if ("WITHDRAWAL".equals(type) || "FEE".equals(type)) return TransactionDirection.DEBIT;

        return tx.getFromAccount() != null && tx.getFromAccount().getId().equals(accountId)
                ? TransactionDirection.DEBIT : TransactionDirection.CREDIT;
    }
}
