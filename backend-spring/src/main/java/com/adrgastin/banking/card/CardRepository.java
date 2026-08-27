package com.adrgastin.banking.card;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CardRepository extends JpaRepository<Card, Integer> {
    Optional<Card> findByCardNumber(String cardNumber);

    List<Card> findByAccountId(Integer accountId);

    List<Card> findByAccount_Users_Id(Integer userId);

    boolean existsByCardNumber(String cardNumber);
}
