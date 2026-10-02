package com.adrgastin.banking.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Encoders;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class JwtTokenProviderTest {
    private static String newSecret() {
        return Encoders.BASE64.encode(Jwts.SIG.HS256.key().build().getEncoded());
    }

    private static JwtTokenProvider providerWith(String secret, int validitySeconds) {
        JwtTokenProvider tokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(tokenProvider, "base64Secret", secret);
        ReflectionTestUtils.setField(tokenProvider, "tokenValiditySeconds", validitySeconds);
        ReflectionTestUtils.invokeMethod(tokenProvider, "init");
        return tokenProvider;
    }

    private final AppUserDetails principal = new AppUserDetails(42, "Pero", List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));

    @Nested
    @DisplayName("generateToken + parseClaims")
    class RoundTrip {
        @Test
        void claimsMatchPrincipal() {
            JwtTokenProvider provider = providerWith(newSecret(), 300);
            Claims claims = provider.parseClaims(provider.generateToken(principal));

            assertEquals("42", claims.getSubject());
            assertEquals("Pero", claims.get("username", String.class));
            assertEquals(List.of("ROLE_ADMIN"), claims.get("roles", List.class));
            assertTrue(claims.getExpiration().after(new Date()));
        }
    }

    @Nested
    @DisplayName("isValid()")
    class IsValid {
        @Test
        void validToken() {
            JwtTokenProvider provider = providerWith(newSecret(), 300);
            assertTrue(provider.isValid(provider.generateToken(principal)));
        }

        @Test
        void expiredToken() {
            JwtTokenProvider provider = providerWith(newSecret(), -10);
            assertFalse(provider.isValid(provider.generateToken(principal)));
        }

        @Test
        void differentKey() {
            String token = providerWith(newSecret(), 300).generateToken(principal);
            JwtTokenProvider provider = providerWith(newSecret(), 300);
            assertFalse(provider.isValid(token));
        }

        @Test
        void malformedToken() {
            assertFalse(providerWith(newSecret(), 300).isValid("not-a-jwt"));
        }

        @Test
        void blankToken() {
            assertFalse(providerWith(newSecret(), 300).isValid(""));
        }
    }
}
