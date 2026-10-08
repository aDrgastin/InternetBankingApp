package com.adrgastin.banking.transaction;

import com.adrgastin.banking.security.AppUserDetails;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transactions")
@AllArgsConstructor
public class TransactionController {
    private final TransactionService transactionService;

    @GetMapping("/my")
    public ResponseEntity<List<TransactionDTO>> getMyTransactions(@AuthenticationPrincipal AppUserDetails principal) {
        return ResponseEntity.ok(transactionService.getAllByUserId(principal.getId()));
    }

    @GetMapping("/account/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MOD')")
    public ResponseEntity<List<TransactionDTO>> getAllByAccountId(@PathVariable Integer id) {
        return ResponseEntity.ok(transactionService.getAllByAccountId(id));
    }

    @GetMapping("/user/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MOD')")
    public ResponseEntity<List<TransactionDTO>> getAllByUserId(@PathVariable Integer id) {
        return ResponseEntity.ok(transactionService.getAllByUserId(id));
    }

    @PostMapping("/transfer")
    public ResponseEntity<TransactionDTO> transferFunds(@RequestBody @Valid TransferFundsCommand command, @AuthenticationPrincipal AppUserDetails principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.transferFunds(command, principal.getId()));
    }

    @PostMapping("/pos")
    @PreAuthorize("hasAnyRole('ADMIN', 'MOD')")
    public ResponseEntity<TransactionDTO> posPayout(@RequestBody @Valid PosPayoutCommand command, @AuthenticationPrincipal AppUserDetails principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.posPayout(command, principal.getId()));
    }

    @PostMapping("/withdraw/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MOD')")
    public ResponseEntity<TransactionDTO> withdrawFunds(@PathVariable Integer id, @RequestBody @Valid WithdrawFundsCommand command, @AuthenticationPrincipal AppUserDetails principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.withdrawFunds(id, command, principal.getId()));
    }

    @PostMapping("/deposit/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MOD')")
    public ResponseEntity<TransactionDTO> depositFunds(@PathVariable Integer id, @RequestBody @Valid DepositFundsCommand command, @AuthenticationPrincipal AppUserDetails principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.depositFunds(id, command, principal.getId()));
    }
}
