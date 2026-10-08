package com.adrgastin.banking.card;

import com.adrgastin.banking.account.Account;
import com.adrgastin.banking.account.AccountRepository;
import com.adrgastin.banking.exception.DuplicateResourceException;
import com.adrgastin.banking.exception.ForbiddenOperationException;
import com.adrgastin.banking.exception.ResourceNotFoundException;
import com.adrgastin.banking.generator.CardNumberGenerator;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CardService {
    private final CardRepository cardRepository;
    private final AccountRepository accountRepository;
    private final CardNumberGenerator generator;
    @Value("${banking.card.validity-months:60}")
    private int VALIDITY_MONTHS;

    @PersistenceContext
    private final EntityManager entityManager;

    @Transactional(readOnly = true)
    public List<CardDTO> getAllByUserId(Integer userId) {
        return cardRepository.findByAccount_Users_Id(userId).stream().map(CardDTO::from).toList();
    }

    @Transactional(readOnly = true)
    public CardDTO getById(Integer id, Integer requestingUserId, boolean isPrivileged) {
        Card card = cardRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Card", id));

        boolean owns = card.getAccount().getUsers().stream()
                .anyMatch(u -> u.getId().equals(requestingUserId));
        if (!owns && !isPrivileged) throw new ResourceNotFoundException("Card", id);

        return CardDTO.from(card);
    }

    @Transactional
    public CardDTO create(CreateCardCommand command, Integer requestingUserId) {
        Account account = accountRepository.findById(command.accountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account", command.accountId()));

        entityManager.createNativeQuery("SET @session_user_id = :userId")
                .setParameter("userId", requestingUserId)
                .executeUpdate();

        Card card = new Card(null, account, generator.generate(), command.type(), CardStatus.ACTIVE, LocalDate.now().plusMonths(VALIDITY_MONTHS), null);
        Card saved;
        try {
            saved = cardRepository.save(card);
        } catch (DataIntegrityViolationException e) {
            String rootMessage = e.getMostSpecificCause().getMessage();
            if (rootMessage != null && rootMessage.contains("card_number")) {
                throw new DuplicateResourceException("Card", "Card with this number already exists", e);
            }
            throw e;
        }

        log.info("Card {} created for account {}", saved.getId(), account.getId());
        return CardDTO.from(saved);
    }

    @Transactional
    public CardDTO updateStatus(Integer id, UpdateCardStatusCommand command, Integer requestingUserId, boolean isPrivileged) {
        Card found = cardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Card", id));
        boolean owns = found.getAccount().getUsers().stream().anyMatch(u -> u.getId().equals(requestingUserId));
        if (!owns && !isPrivileged) throw new ResourceNotFoundException("Card", id);
        if (!isPrivileged && command.status() != CardStatus.BLOCKED) {
            throw new ForbiddenOperationException("Only staff can set this status");
        }

        entityManager.createNativeQuery("SET @session_user_id = :userId")
                .setParameter("userId", requestingUserId)
                .executeUpdate();

        found.setStatus(command.status());
        Card updated = cardRepository.save(found);
        log.info("Status for card {} updated to {}", updated.getId(), updated.getStatus());
        return CardDTO.from(updated);
    }
}
