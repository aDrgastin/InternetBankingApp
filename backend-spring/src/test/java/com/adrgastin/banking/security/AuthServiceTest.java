package com.adrgastin.banking.security;

import com.adrgastin.banking.exception.DuplicateResourceException;
import com.adrgastin.banking.role.RoleRepository;
import com.adrgastin.banking.user.AppUserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {
    @Mock
    private AppUserRepository appUserRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private UserDetailsService userDetailsService;
    @Mock
    private JwtTokenProvider jwtTokenProvider;
    @Mock
    private RefreshTokenService refreshTokenService;
    @InjectMocks
    private AuthService authService;

    @Nested
    @DisplayName("login()")
    class Login {
        @Test
        @DisplayName("bad credentials -> throws")
        void badCredentials() {
            LoginRequest request = new LoginRequest("bad", "bad");

            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenThrow(BadCredentialsException.class);

            assertThrows(BadCredentialsException.class, () -> authService.login(request));
            verify(userDetailsService, never()).loadUserByUsername(anyString());
            verify(appUserRepository, never()).findById(anyInt());
            verify(jwtTokenProvider, never()).generateToken(any());
            verify(refreshTokenService, never()).issue(anyInt());
        }

        @Test
        @DisplayName("user not found -> throws")
        void userNotFound() {
            LoginRequest request = new LoginRequest("username", "pass");
            AppUserDetails principal = new AppUserDetails(1, "username", List.of(new SimpleGrantedAuthority("ROLE_USER")));

            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(mock(Authentication.class));
            when(userDetailsService.loadUserByUsername(request.username())).thenReturn(principal);
            when(appUserRepository.findById(principal.getId())).thenReturn(Optional.empty());

            assertThrows(IllegalStateException.class, () -> authService.login(request));
            verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
            verify(userDetailsService).loadUserByUsername(request.username());
        }
    }

    @Nested
    @DisplayName("register()")
    class Register {
        @Test
        @DisplayName("username exists -> throws")
        void usernameExists() {
            RegisterRequest request = new RegisterRequest("58140157981", "username", "password", "Pero", "Peric", "pperic@mail.com");

            when(appUserRepository.existsByUsername(request.username())).thenReturn(true);

            assertThrows(DuplicateResourceException.class, () -> authService.register(request));
            verify(passwordEncoder, never()).encode(anyString());
            verify(roleRepository, never()).findByName(anyString());
            verify(appUserRepository, never()).save(any());
            verify(jwtTokenProvider, never()).generateToken(any());
            verify(refreshTokenService, never()).issue(anyInt());
        }
    }
}
