package com.adrgastin.banking.transaction;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Integer> {
    List<Transaction> findAllByFromAccount_IdOrToAccount_Id(Integer fromAccountId, Integer toAccountId);

    List<Transaction> findAllByFromAccount_Users_IdOrToAccount_Users_Id(Integer fromUserId, Integer toUserId);
}
