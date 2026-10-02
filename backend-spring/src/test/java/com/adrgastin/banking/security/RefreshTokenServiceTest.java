package com.adrgastin.banking.security;

import com.adrgastin.banking.exception.InvalidRefreshTokenException;
import com.adrgastin.banking.user.AppUser;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RefreshTokenServiceTest {
    @Mock
    private RefreshTokenRepository refreshTokenRepository;
    @InjectMocks
    private RefreshTokenService refreshTokenService;

    @Nested
    @DisplayName("rotate()")
    class Rotate {
        @Test
        @DisplayName("reused token -> revokes all user tokens and throws")
        void reuse() {
            AppUser appUser = new AppUser();
            appUser.setId(1);
            RefreshToken used = new RefreshToken();
            used.setUser(appUser);
            used.setRevoked(true);

            when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(used));

            assertThrows(InvalidRefreshTokenException.class, () -> refreshTokenService.rotate("raw-token"));
            verify(refreshTokenRepository).revokeAllByUserId(1);
        }

        @Test
        @DisplayName("expired token -> throws, does not revoke all")
        void expired() {
            AppUser appUser = new AppUser();
            appUser.setId(1);
            RefreshToken expired = new RefreshToken();
            expired.setUser(appUser);
            expired.setRevoked(false);
            expired.setExpiresAt(Instant.now().minusSeconds(1));

            when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(expired));

            assertThrows(InvalidRefreshTokenException.class, () -> refreshTokenService.rotate("raw-token"));
            verify(refreshTokenRepository, never()).revokeAllByUserId(any());
        }
    }
}
