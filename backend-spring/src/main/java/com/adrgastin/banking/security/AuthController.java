package com.adrgastin.banking.security;

import com.adrgastin.banking.user.AppUser;
import com.adrgastin.banking.user.AppUserDTO;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    @Value("${jwt.refresh-token-validity-seconds}")
    private long refreshCookieMaxAgeSeconds;
    @Value("${jwt.refresh-cookie-secure}")
    private boolean isRefreshCookieSecure;
    @Value("${server.servlet.context-path:}")
    private String contextPath;

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody @Valid LoginRequest loginRequest, HttpServletResponse response) {
        AuthResult result = authService.login(loginRequest);
        setRefreshCookie(response, result.refreshToken());
        return ResponseEntity.ok(toJwtResponse(result));
    }

    @PostMapping("/register")
    public ResponseEntity<JwtResponse> register(@RequestBody @Valid RegisterRequest registerRequest, HttpServletResponse response) {
        AuthResult result = authService.register(registerRequest);
        setRefreshCookie(response, result.refreshToken());
        return ResponseEntity.status(HttpStatus.CREATED).body(toJwtResponse(result));
    }

    @PostMapping("/refresh")
    public ResponseEntity<JwtResponse> refresh(@CookieValue("refreshToken") String rawRefreshToken, HttpServletResponse response) {
        AuthResult result =  authService.refresh(rawRefreshToken);
        setRefreshCookie(response, result.refreshToken());
        return ResponseEntity.ok(toJwtResponse(result));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@CookieValue(value = "refreshToken", required = false) String rawRefreshToken, HttpServletResponse response) {
        if (rawRefreshToken != null) {
            authService.logout(rawRefreshToken);
        }
        clearRefreshCookie(response);
        return ResponseEntity.noContent().build();
    }

    private void setRefreshCookie(HttpServletResponse response, String rawRefreshToken) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", rawRefreshToken)
                .httpOnly(true)
                .secure(isRefreshCookieSecure)
                .sameSite("Strict")
                .path(contextPath + "/auth")
                .maxAge(refreshCookieMaxAgeSeconds)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(isRefreshCookieSecure)
                .sameSite("Strict")
                .path(contextPath + "/auth")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private JwtResponse toJwtResponse(AuthResult result) {
        AppUser u = result.user();
        return new JwtResponse(result.accessToken(), new AppUserDTO(u.getId(), u.getPin(), u.getUsername(), u.getFirstName(), u.getLastName(), u.getEmail(), u.getCreatedAt(), result.roles()));
    }
}
