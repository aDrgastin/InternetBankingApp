package com.adrgastin.banking.transaction;

import com.adrgastin.banking.account.Account;
import com.adrgastin.banking.account.AccountRepository;
import com.adrgastin.banking.account.AccountStatus;
import com.adrgastin.banking.card.Card;
import com.adrgastin.banking.card.CardRepository;
import com.adrgastin.banking.card.CardStatus;
import com.adrgastin.banking.exception.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CardRepository cardRepository;
    private final TransactionTypeRepository transactionTypeRepository;

    @PersistenceContext
    private final EntityManager entityManager;

    public List<TransactionDTO> getAllByAccountId(Integer accountId) {
        return transactionRepository.findAllByFromAccount_IdOrToAccount_Id(accountId, accountId)
                .stream().map(t -> TransactionDTO.forAccount(t, accountId)).toList();
    }

    public List<TransactionDTO> getAllByUserId(Integer userId) {
        return transactionRepository.findAllByFromAccount_Users_IdOrToAccount_Users_Id(userId, userId)
                .stream().map(t -> TransactionDTO.forUser(t, userId)).toList();
    }

    @Transactional
    public TransactionDTO transferFunds(TransferFundsCommand command, Integer requestingUserId) {
        Account fromAccount = accountRepository.findById(command.fromAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account", command.fromAccountId()));
        boolean owns = fromAccount.getUsers().stream().anyMatch(u -> u.getId().equals(requestingUserId));
        if (!owns) throw new ResourceNotFoundException("Account", command.fromAccountId());

        Account toAccountLookup = accountRepository.findByIban(command.toIban())
                .orElseThrow(() -> new ResourceNotFoundException("Account", command.toIban()));
        if (fromAccount.getId().equals(toAccountLookup.getId()))
            throw new InvalidTransferException("Cannot transfer to the same account: " + fromAccount.getId());

        Integer lowerId = Math.min(fromAccount.getId(), toAccountLookup.getId());
        Integer higherId = Math.max(fromAccount.getId(), toAccountLookup.getId());
        Account first = accountRepository.findByIdForUpdate(lowerId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", lowerId));
        Account second = accountRepository.findByIdForUpdate(higherId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", higherId));
        Account from = fromAccount.getId().equals(lowerId) ? first : second;
        Account to = fromAccount.getId().equals(lowerId) ? second : first;

        if (from.getStatus() != AccountStatus.ACTIVE) throw new AccountNotActiveException("Account not active: " + from.getId());
        if (to.getStatus() != AccountStatus.ACTIVE) throw new AccountNotActiveException("Account not active: " + to.getId());
        if (from.getBalance().compareTo(command.amount()) < 0) throw new InsufficientFundsException("Insufficient funds: " + from.getId());

        from.setBalance(from.getBalance().subtract(command.amount()));
        to.setBalance(to.getBalance().add(command.amount()));

        entityManager.createNativeQuery("SET @session_user_id = :userId")
                .setParameter("userId", requestingUserId)
                .executeUpdate();

        Transaction transaction = new Transaction();
        transaction.setReference(UUID.randomUUID().toString());
        transaction.setType(transactionTypeRepository.findByName("TRANSFER").orElseThrow(() -> new IllegalStateException("Missing TRANSFER transaction type")));
        transaction.setFromAccount(from);
        transaction.setFromIban(from.getIban());
        transaction.setToAccount(to);
        transaction.setToIban(to.getIban());
        transaction.setAmount(command.amount());
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setDescription(command.description());
        Transaction created = transactionRepository.save(transaction);

        log.info("Transfer of {} from account {} (IBAN {}) to account {} (IBAN {}) completed by user {}", command.amount(), from.getId(), from.getIban(), to.getId(), to.getIban(), requestingUserId);
        return TransactionDTO.forUser(created, requestingUserId);
    }

    @Transactional
    public TransactionDTO posPayout(PosPayoutCommand command, Integer requestingUserId) {
        Card card = cardRepository.findByCardNumber(command.cardNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Card", command.cardNumber()));
        boolean owns = card.getAccount().getUsers().stream()
                .anyMatch(u -> u.getId().equals(requestingUserId));
        if (!owns) throw new ResourceNotFoundException("Card", command.cardNumber());
        if (card.getStatus() != CardStatus.ACTIVE) throw new CardNotActiveException("Card not active: " + card.getId());

        Account account = accountRepository.findByIdForUpdate(card.getAccount().getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Account", card.getAccount().getId()));
        if (account.getStatus() != AccountStatus.ACTIVE) throw new AccountNotActiveException("Account not active: " + account.getId());
        if (account.getBalance().compareTo(command.amount()) < 0) throw new InsufficientFundsException("Insufficient funds: " + account.getId());

        account.setBalance(account.getBalance().subtract(command.amount()));

        entityManager.createNativeQuery("SET @session_user_id = :userId")
                .setParameter("userId", requestingUserId)
                .executeUpdate();

        Transaction transaction = new Transaction();
        transaction.setReference(UUID.randomUUID().toString());
        transaction.setType(transactionTypeRepository.findByName("POS")
                .orElseThrow(() -> new IllegalStateException("Missing POS transaction type")));
        transaction.setFromAccount(account);
        transaction.setFromIban(account.getIban());
        transaction.setToAccount(null);
        transaction.setToIban(null);
        transaction.setAmount(command.amount());
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setDescription(command.merchantCategory() == null || command.merchantCategory().isBlank() ? command.merchantName() : command.merchantName() + " (" + command.merchantCategory() + ")");
        Transaction created = transactionRepository.save(transaction);

        log.info("POS of {} from account {} (IBAN {}) to merchant '{}' completed by user {}", command.amount(), card.getAccount().getId(), card.getAccount().getIban(), command.merchantName(), requestingUserId);
        return TransactionDTO.forAccount(created, account.getId());
    }

    @Transactional
    public TransactionDTO withdrawFunds(Integer accountId, WithdrawFundsCommand command, Integer requestingUserId) {
        Account account = accountRepository.findByIdForUpdate(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", accountId));
        boolean owns = account.getUsers().stream().anyMatch(u -> u.getId().equals(requestingUserId));
        if (!owns) throw new ResourceNotFoundException("Account", accountId);
        if (account.getStatus() != AccountStatus.ACTIVE) throw new AccountNotActiveException("Account not active: " + account.getId());
        if (account.getBalance().compareTo(command.amount()) < 0) throw new InsufficientFundsException("Insufficient funds: " + account.getId());

        account.setBalance(account.getBalance().subtract(command.amount()));

        entityManager.createNativeQuery("SET @session_user_id = :userId")
                .setParameter("userId", requestingUserId)
                .executeUpdate();

        Transaction transaction = new Transaction();
        transaction.setReference(UUID.randomUUID().toString());
        transaction.setType(transactionTypeRepository.findByName("WITHDRAW").orElseThrow(() -> new IllegalStateException("Missing WITHDRAW transaction type")));
        transaction.setFromAccount(account);
        transaction.setFromIban(account.getIban());
        transaction.setAmount(command.amount());
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setDescription(command.description());
        Transaction created = transactionRepository.save(transaction);

        log.info("Withdraw of {} from account {} (IBAN {}) completed by user {}", command.amount(), account.getId(), account.getIban(), requestingUserId);
        return  TransactionDTO.forAccount(created, accountId);
    }

    @Transactional
    public TransactionDTO depositFunds(Integer accountId, DepositFundsCommand command, Integer requestingUserId) {
        Account account = accountRepository.findByIdForUpdate(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", accountId));
        boolean owns = account.getUsers().stream().anyMatch(u -> u.getId().equals(requestingUserId));
        if (!owns) throw new ResourceNotFoundException("Account", accountId);
        if (account.getStatus() != AccountStatus.ACTIVE) throw new AccountNotActiveException("Account not active: " + account.getId());

        account.setBalance(account.getBalance().add(command.amount()));

        entityManager.createNativeQuery("SET @session_user_id = :userId")
                .setParameter("userId", requestingUserId)
                .executeUpdate();

        Transaction transaction = new Transaction();
        transaction.setReference(UUID.randomUUID().toString());
        transaction.setType(transactionTypeRepository.findByName("DEPOSIT")
                .orElseThrow(() -> new IllegalStateException("Missing DEPOSIT transaction type")));
        transaction.setToAccount(account);
        transaction.setToIban(account.getIban());
        transaction.setAmount(command.amount());
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setDescription(command.description());
        Transaction created = transactionRepository.save(transaction);

        log.info("Deposit of {} to account {} (IBAN {}) completed by user {}", command.amount(), accountId, account.getIban(), requestingUserId);
        return  TransactionDTO.forAccount(created, accountId);
    }
}
