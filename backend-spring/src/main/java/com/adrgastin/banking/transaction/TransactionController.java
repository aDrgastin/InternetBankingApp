package com.adrgastin.banking.transaction;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transactions")
@AllArgsConstructor
public class TransactionController {
    private final TransactionService transactionService;

    @GetMapping("/account/{id}")
    public ResponseEntity<List<TransactionDTO>> getAllByAccountId(@PathVariable Integer id) {
        return ResponseEntity.ok(transactionService.getAllByAccountId(id));
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<List<TransactionDTO>> getAllByUserId(@PathVariable Integer id) {
        return ResponseEntity.ok(transactionService.getAllByUserId(id));
    }

    @PostMapping("/transfer")
    public ResponseEntity<TransactionDTO> transferFunds(@RequestBody @Valid TransferFundsCommand command) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.transferFunds(command, null));
    }

    @PostMapping("/pos")
    public ResponseEntity<TransactionDTO> posPayout(@RequestBody @Valid PosPayoutCommand command) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.posPayout(command, null));
    }

    @PostMapping("/withdraw/{id}")
    public ResponseEntity<TransactionDTO> withdrawFunds(@PathVariable Integer id, @RequestBody @Valid WithdrawFundsCommand command) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.withdrawFunds(id, command, null));
    }

    @PostMapping("/deposit/{id}")
    public ResponseEntity<TransactionDTO> depositFunds(@PathVariable Integer id, @RequestBody @Valid DepositFundsCommand command) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.depositFunds(id, command, null));
    }
}
