package com.adrgastin.banking.account;

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
@RequestMapping("/accounts")
@AllArgsConstructor
public class AccountController {
    private final AccountService accountService;

    @GetMapping("/my")
    public ResponseEntity<List<AccountDTO>> getMyAccounts(@AuthenticationPrincipal AppUserDetails principal) {
        return ResponseEntity.ok(accountService.getAllByUserId(principal.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccountDTO> getById(@PathVariable Integer id, @AuthenticationPrincipal AppUserDetails principal) {
        return ResponseEntity.ok(accountService.getById(id, principal.getId(), principal.isPrivileged()));
    }

    @GetMapping("/user/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MOD')")
    public ResponseEntity<List<AccountDTO>> getAllByUserId(@PathVariable Integer id) {
        return ResponseEntity.ok(accountService.getAllByUserId(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MOD')")
    public ResponseEntity<AccountDTO> save(@RequestBody @Valid CreateAccountCommand command, @AuthenticationPrincipal AppUserDetails principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(accountService.create(command, principal.getId()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MOD')")
    public ResponseEntity<AccountDTO> updateStatus(@PathVariable Integer id, @RequestBody @Valid UpdateAccountStatusCommand command, @AuthenticationPrincipal AppUserDetails principal) {
        return ResponseEntity.ok(accountService.updateStatus(id, command, principal.getId()));
    }
}
