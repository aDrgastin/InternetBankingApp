package com.adrgastin.banking.security;

import com.adrgastin.banking.exception.InvalidRefreshTokenException;
import com.adrgastin.banking.exception.ResourceNotFoundException;
import com.adrgastin.banking.user.AppUser;
import com.adrgastin.banking.user.AppUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenService {
    private final RefreshTokenRepository refreshTokenRepository;
    private final AppUserRepository appUserRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${jwt.refresh-token-validity-seconds}")
    private int refreshValiditySeconds;

    @Transactional
    public String issue(Integer userId) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        String rawToken = generateRawToken();

        RefreshToken entity = new RefreshToken();
        entity.setUser(user);
        entity.setTokenHash(hashToken(rawToken));
        entity.setExpiresAt(Instant.now().plusSeconds(refreshValiditySeconds));
        entity.setRevoked(false);
        refreshTokenRepository.save(entity);

        return rawToken;
    }

    @Transactional(noRollbackFor = InvalidRefreshTokenException.class)
    public Integer rotate(String rawOldToken) {
        RefreshToken existing = refreshTokenRepository.findByTokenHash(hashToken(rawOldToken))
                .orElseThrow(() -> new InvalidRefreshTokenException("Unknown refresh token"));

        if (existing.isRevoked()) {
            log.warn("Refresh token reuse detected for user {}", existing.getUser().getId());
            refreshTokenRepository.revokeAllByUserId(existing.getUser().getId());
            throw new InvalidRefreshTokenException("Refresh token reuse detected");
        }
        if (existing.getExpiresAt().isBefore(Instant.now())) {
            throw new InvalidRefreshTokenException("Refresh token expired");
        }

        existing.setRevoked(true);
        return existing.getUser().getId();
    }

    @Transactional
    public void revoke(String rawToken) {
        refreshTokenRepository.findByTokenHash(hashToken(rawToken)).ifPresent(t -> {
            t.setRevoked(true);
            log.info("Revoked refresh token for user {}", t.getUser().getId());
        });
    }

    @Transactional
    public void revokeAll(Integer userId) {
        log.info("Revoking all refresh tokens for user {}", userId);
        refreshTokenRepository.revokeAllByUserId(userId);
    }

    private String generateRawToken() {
        byte[] randomBytes = new byte[64];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(rawToken.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
