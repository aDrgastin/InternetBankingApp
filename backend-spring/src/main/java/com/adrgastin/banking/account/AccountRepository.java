package com.adrgastin.banking.account;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Integer> {
    Optional<Account> findByIban(String iban);

    List<Account> findByUsers_Id(Integer userId);
}
