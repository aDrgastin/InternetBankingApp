package com.adrgastin.banking.account;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AccountTypeRepository extends JpaRepository<AccountType, Byte> {
    Optional<AccountType> findByName(String name);
}
