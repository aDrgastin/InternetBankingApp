package com.adrgastin.banking.account;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/accounts")
@AllArgsConstructor
public class AccountController {
    private final AccountService accountService;

    @GetMapping("/my")
    public ResponseEntity<List<AccountDTO>> getMyAccounts() {
        return ResponseEntity.ok(accountService.getAllByUserId(null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccountDTO> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(accountService.getById(id, null));
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<List<AccountDTO>> getAllByUserId(@PathVariable Integer id) {
        return ResponseEntity.ok(accountService.getAllByUserId(id));
    }

    @PostMapping
    public ResponseEntity<AccountDTO> save(@RequestBody @Valid CreateAccountCommand command) {
        return ResponseEntity.ok(accountService.create(command, null));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AccountDTO> updateStatus(@PathVariable Integer id, @RequestBody @Valid UpdateAccountStatusCommand command) {
        return ResponseEntity.ok(accountService.updateStatus(id, command, null));
    }
}
