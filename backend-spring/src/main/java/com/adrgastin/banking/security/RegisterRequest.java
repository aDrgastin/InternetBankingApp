package com.adrgastin.banking.security;

import com.adrgastin.banking.validation.Pin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "PIN cannot be empty") @Pin String pin,
        @NotBlank(message = "Username cannot be empty") @Size(message = "Username can be maximum {max} characters long", max = 45) String username,
        @NotBlank(message = "Password cannot be empty") String password,
        @NotBlank(message = "First name cannot be empty") String firstName,
        @NotBlank(message = "Last name cannot be empty") String lastName,
        @Email(message = "Invalid email format") @Size(message = "Email can be maximum {max} characters long", max = 75) String email
) { }
