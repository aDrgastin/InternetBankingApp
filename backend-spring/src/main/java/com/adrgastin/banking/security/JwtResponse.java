package com.adrgastin.banking.security;

import com.adrgastin.banking.user.AppUserDTO;

public record JwtResponse(
        String accessToken,
        AppUserDTO user
) { }
