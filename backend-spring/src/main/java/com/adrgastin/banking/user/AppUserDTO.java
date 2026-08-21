package com.adrgastin.banking.user;

import java.time.LocalDateTime;

public record AppUserDTO(
        Integer id,
        String pin,
        String username,
        String firstName,
        String lastName,
        String email,
        LocalDateTime createdAt
) { }
