package com.adrgastin.banking.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.List;

@Component
@Slf4j
public class JwtTokenProvider {
    @Value("${jwt.base64-secret}")
    private String base64Secret;
    @Value("${jwt.access-token-validity-seconds}")
    private int tokenValiditySeconds;

    private SecretKey key;
    private JwtParser jwtParser;

    @PostConstruct
    private void init() {
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(base64Secret));
        this.jwtParser = Jwts.parser().verifyWith(key).build();
    }

    public String generateToken(AppUserDetails principal) {
        Instant now = Instant.now();
        List<String> roles = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();
        return Jwts.builder()
                .subject(String.valueOf(principal.getId()))
                .claim("username", principal.getUsername())
                .claim("roles", roles)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(tokenValiditySeconds)))
                .signWith(key)
                .compact();
    }

    public Claims parseClaims(String token) {
        return jwtParser.parseSignedClaims(token)
                .getPayload();
    }

    public boolean isValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch(ExpiredJwtException e) {
            log.debug(e.getMessage());
            return false;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn(e.getMessage());
            return false;
        }
    }
}
