package com.adrgastin.banking.security;

import com.adrgastin.banking.user.AppUser;

import java.util.List;

public record AuthResult(
        String accessToken,
        String refreshToken,
        AppUser user,
        List<String> roles
) { }
