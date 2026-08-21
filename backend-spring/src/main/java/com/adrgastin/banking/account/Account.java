package com.adrgastin.banking.account;

import com.adrgastin.banking.user.AppUser;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SourceType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "account")
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String iban;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal balance;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AccountStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_id", nullable = false)
    private AccountType accountType;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    @CreationTimestamp(source = SourceType.DB)
    private LocalDateTime createdAt;

    @ManyToMany(mappedBy = "accounts", fetch = FetchType.LAZY)
    private Set<AppUser> users = new HashSet<>();
}
