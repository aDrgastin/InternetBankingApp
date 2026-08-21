package com.adrgastin.banking.card;

import com.adrgastin.banking.account.Account;
import jakarta.persistence.*;
import lombok.Getter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SourceType;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "card")
@Getter
public class Card {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(name = "card_number", nullable = false,  unique = true)
    private String cardNumber;

    @Column(name = "card_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private CardType cardType;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private CardStatus status;

    @Column(name = "expiry_date",  nullable = false)
    private LocalDate expiryDate;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    @CreationTimestamp(source = SourceType.DB)
    private LocalDateTime createdAt;
}
