package com.adrgastin.banking.account;

import com.adrgastin.banking.exception.DuplicateResourceException;
import com.adrgastin.banking.exception.ResourceNotFoundException;
import com.adrgastin.banking.generator.IbanGenerator;
import com.adrgastin.banking.user.AppUser;
import com.adrgastin.banking.user.AppUserRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@AllArgsConstructor
@Slf4j
public class AccountService {
    private final AccountRepository accountRepository;
    private final AppUserRepository appUserRepository;
    private final AccountTypeRepository accountTypeRepository;
    private final IbanGenerator generator;

    @Transactional(readOnly = true)
    public AccountDTO getById(Integer id, Integer requestingUserId) {
        Account account = accountRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Account", id));

        boolean owns = account.getUsers().stream().anyMatch(u -> u.getId().equals(requestingUserId));
        if (!owns) throw new ResourceNotFoundException("Account", id);

        return AccountDTO.from(account);
    }

    @Transactional(readOnly = true)
    public List<AccountDTO> getAllByUserId(Integer id) {
        return accountRepository.findByUsers_Id(id).stream().map(AccountDTO::from).toList();
    }

    @Transactional
    public AccountDTO create(CreateAccountCommand command, Integer requestingUserId) {
        AppUser owner = appUserRepository.findById(requestingUserId)
                .orElseThrow(() -> new ResourceNotFoundException("AppUser", requestingUserId));
        AccountType accountType = accountTypeRepository.findByName(command.type())
                .orElseThrow(() -> new ResourceNotFoundException("AccountType", command.type()));
        Account account = new Account(null, generator.generate(), BigDecimal.ZERO, AccountStatus.ACTIVE, accountType, LocalDateTime.now(), new HashSet<>(Set.of(owner)));

        Account saved;
        try {
            saved = accountRepository.save(account);
            accountRepository.flush();
        } catch (DataIntegrityViolationException e) {
            String rootMessage = e.getMostSpecificCause().getMessage();
            if (rootMessage != null && rootMessage.contains("iban")) {
                throw new DuplicateResourceException("Account", "Account with this IBAN already exists", e);
            }
            throw e;
        }
        owner.getAccounts().add(saved);
        //appUserRepository.save(owner);

        log.info("Account {} created for user {}", saved.getId(), owner.getId());
        return AccountDTO.from(saved);
    }

    @Transactional
    public AccountDTO updateStatus(Integer id, UpdateAccountStatusCommand command, Integer requestingUserId) {
        Account found = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account", id));
        boolean owns = found.getUsers().stream().anyMatch(u -> u.getId().equals(requestingUserId));
        if (!owns) throw new ResourceNotFoundException("Account", id);

        found.setStatus(command.status());
        Account updated = accountRepository.save(found);
        log.info("Status for account {} updated to {}", updated.getId(), updated.getStatus());
        return AccountDTO.from(updated);
    }
}
