package com.adrgastin.banking.card;

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
@RequestMapping("/cards")
@AllArgsConstructor
public class CardController {
    private final CardService cardService;

    @GetMapping("/my")
    public ResponseEntity<List<CardDTO>> getMyCards(@AuthenticationPrincipal AppUserDetails principal) {
        return ResponseEntity.ok(cardService.getAllByUserId(principal.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CardDTO> getById(@PathVariable Integer id, @AuthenticationPrincipal AppUserDetails principal) {
        return ResponseEntity.ok(cardService.getById(id, principal.getId(), principal.isPrivileged()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MOD')")
    public ResponseEntity<CardDTO> create(@RequestBody @Valid CreateCardCommand command, @AuthenticationPrincipal AppUserDetails principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cardService.create(command, principal.getId()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<CardDTO> updateStatus(@PathVariable Integer id, @RequestBody @Valid UpdateCardStatusCommand command, @AuthenticationPrincipal AppUserDetails principal) {
        return ResponseEntity.ok(cardService.updateStatus(id, command, principal.getId(), principal.isPrivileged()));
    }
}
