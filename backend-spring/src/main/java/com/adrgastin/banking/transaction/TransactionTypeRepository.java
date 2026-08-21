package com.adrgastin.banking.transaction;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TransactionTypeRepository extends JpaRepository<TransactionType, Byte> {
    Optional<TransactionType> findByName(String name);
}
