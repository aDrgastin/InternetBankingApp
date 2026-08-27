package com.adrgastin.banking.card;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cards")
@AllArgsConstructor
public class CardController {
    private final CardService cardService;

    @GetMapping("/my")
    public ResponseEntity<List<CardDTO>> getMyCards() {
        return ResponseEntity.ok(cardService.getAllByUserId(null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CardDTO> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(cardService.getById(id, null));
    }

    @PostMapping
    public ResponseEntity<CardDTO> create(@RequestBody @Valid CreateCardCommand command) {
        return ResponseEntity.ok(cardService.create(command, null));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<CardDTO> updateStatus(@PathVariable Integer id, @RequestBody @Valid UpdateCardStatusCommand command) {
        return ResponseEntity.ok(cardService.updateStatus(id, command, null));
    }
}
