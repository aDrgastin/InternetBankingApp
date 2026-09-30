package com.adrgastin.banking.card;

import com.adrgastin.banking.account.Account;
import com.adrgastin.banking.account.AccountStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record CardDTO(
        Integer id,
        Integer accountId,
        String iban,
        AccountStatus accountStatus,
        String accountType,
        String number,
        CardType type,
        CardStatus status,
        LocalDate expiryDate,
        LocalDateTime createdAt
) {
    public static CardDTO from(Card card) {
        Account account = card.getAccount();
        return new CardDTO(card.getId(), account.getId(), account.getIban(), account.getStatus(), account.getAccountType().getName(), card.getCardNumber(), card.getCardType(), resolveStatus(card), card.getExpiryDate(), card.getCreatedAt());
    }

    private static CardStatus resolveStatus(Card card) {
        if (card.getExpiryDate().isBefore(LocalDate.now())) {
            return CardStatus.EXPIRED;
        }
        return card.getStatus();
    }
}
