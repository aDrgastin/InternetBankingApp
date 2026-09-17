package com.adrgastin.banking.transaction;

import com.adrgastin.banking.account.Account;
import com.adrgastin.banking.account.AccountRepository;
import com.adrgastin.banking.account.AccountStatus;
import com.adrgastin.banking.account.AccountType;
import com.adrgastin.banking.exception.InsufficientFundsException;
import com.adrgastin.banking.user.AppUser;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TransactionServiceTest {
    @Mock
    private AccountRepository accountRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private TransactionTypeRepository transactionTypeRepository;

    @Mock
    private EntityManager entityManager;

    @Mock
    private Query query;

    @InjectMocks
    private TransactionService transactionService;

    @Nested
    @DisplayName("transferFunds()")
    class TransferFunds {
        @Test
        @DisplayName("returns a transaction on success")
        void success() {
            AccountType checking = new AccountType((byte) 1, "CHECKING");
            Account from = new Account(5, "HR1111111111111111111", BigDecimal.valueOf(100.00), AccountStatus.ACTIVE, checking, LocalDateTime.now(), new HashSet<>());
            Account to = new Account(8, "HR2222222222222222222", BigDecimal.valueOf(50.00), AccountStatus.ACTIVE, checking, LocalDateTime.now(), new HashSet<>());
            AppUser owner = new AppUser();
            owner.setId(1);
            from.getUsers().add(owner);

            TransferFundsCommand command = new TransferFundsCommand(5, to.getIban(), BigDecimal.valueOf(30.00), "test");

            when(accountRepository.findById(from.getId())).thenReturn(Optional.of(from));
            when(accountRepository.findByIban(to.getIban())).thenReturn(Optional.of(to));
            when(accountRepository.findByIdForUpdate(from.getId())).thenReturn(Optional.of(from));
            when(accountRepository.findByIdForUpdate(to.getId())).thenReturn(Optional.of(to));
            when(transactionTypeRepository.findByName("TRANSFER")).thenReturn(Optional.of(new TransactionType((byte) 1, "TRANSFER")));
            when(entityManager.createNativeQuery(anyString())).thenReturn(query);
            when(query.setParameter(anyString(), any())).thenReturn(query);
            when(transactionRepository.save(any(Transaction.class)))
                    .thenAnswer(inv -> inv.getArgument(0));

            TransactionDTO result = transactionService.transferFunds(command, owner.getId());

            assertThat(from.getBalance()).isEqualByComparingTo("70.00");
            assertThat(to.getBalance()).isEqualByComparingTo("80.00");
            assertThat(result).isNotNull();
            verify(transactionRepository).save(any(Transaction.class));
        }

        @Test
        @DisplayName("insufficient funds -> throws and does not save")
        void insufficientFunds() {
            AccountType checking = new AccountType((byte) 1, "CHECKING");
            Account from = new Account(5, "HR1111111111111111111", BigDecimal.valueOf(10.00), AccountStatus.ACTIVE, checking, LocalDateTime.now(), new HashSet<>());
            Account to = new Account(8, "HR2222222222222222222", BigDecimal.valueOf(50.00), AccountStatus.ACTIVE, checking, LocalDateTime.now(), new HashSet<>());
            AppUser owner = new AppUser();
            owner.setId(1);
            from.getUsers().add(owner);

            TransferFundsCommand command = new TransferFundsCommand(5, to.getIban(), BigDecimal.valueOf(30.00), "test");

            when(accountRepository.findById(from.getId())).thenReturn(Optional.of(from));
            when(accountRepository.findByIban(to.getIban())).thenReturn(Optional.of(to));
            when(accountRepository.findByIdForUpdate(from.getId())).thenReturn(Optional.of(from));
            when(accountRepository.findByIdForUpdate(to.getId())).thenReturn(Optional.of(to));

            assertThrows(InsufficientFundsException.class, () -> transactionService.transferFunds(command, owner.getId()));
            verify(transactionRepository, never()).save(any());
        }
    }
}
