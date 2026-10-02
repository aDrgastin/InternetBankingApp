package com.adrgastin.banking.security;

import com.adrgastin.banking.exception.DuplicateResourceException;
import com.adrgastin.banking.exception.InvalidRefreshTokenException;
import com.adrgastin.banking.exception.ResourceNotFoundException;
import com.adrgastin.banking.role.Role;
import com.adrgastin.banking.role.RoleRepository;
import com.adrgastin.banking.user.AppUser;
import com.adrgastin.banking.user.AppUserRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@AllArgsConstructor
@Slf4j
public class AuthService {
    private final AppUserRepository appUserRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;

    public AuthResult login(LoginRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.username(), request.password()));

        AppUserDetails principal = (AppUserDetails) userDetailsService.loadUserByUsername(request.username());
        AppUser appUser = appUserRepository.findById(principal.getId())
                .orElseThrow(() -> new IllegalStateException("Authenticated user vanished"));

        String accessToken = jwtTokenProvider.generateToken(principal);
        String refreshToken = refreshTokenService.issue(principal.getId());
        List<String> roles = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        log.info("User {} logged in", principal.getId());
        return new AuthResult(accessToken, refreshToken, appUser, roles);
    }

    @Transactional(noRollbackFor = InvalidRefreshTokenException.class)
    public AuthResult refresh(String rawRefreshToken) {
        Integer userId = refreshTokenService.rotate(rawRefreshToken);
        AppUser appUser = appUserRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("AppUser", userId));
        AppUserDetails principal = (AppUserDetails) userDetailsService.loadUserByUsername(appUser.getUsername());

        String newAccessToken = jwtTokenProvider.generateToken(principal);
        String newRefreshToken = refreshTokenService.issue(userId);
        List<String> roles = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        log.debug("Tokens refreshed for user {}", principal.getId());
        return new AuthResult(newAccessToken, newRefreshToken, appUser, roles);
    }

    public void logout(String rawRefreshToken) {
        refreshTokenService.revoke(rawRefreshToken);
    }

    @Transactional
    public AuthResult register(RegisterRequest request) {
        if (appUserRepository.existsByUsername(request.username()))
            throw new DuplicateResourceException("AppUser", "Username already exists");
        AppUser user = new AppUser();
        user.setPin(request.pin());
        user.setUsername(request.username());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(request.email());

        Role defaultRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new IllegalStateException("Role USER not found"));
        user.setRoles(new HashSet<>(Set.of(defaultRole)));

        AppUser saved = appUserRepository.save(user);
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + defaultRole.getName()));
        AppUserDetails principal = new AppUserDetails(saved, authorities);

        String accessToken = jwtTokenProvider.generateToken(principal);
        String refreshToken = refreshTokenService.issue(saved.getId());

        log.info("New user registered: {}", saved.getUsername());
        return new AuthResult(accessToken, refreshToken, saved, List.of("ROLE_" + defaultRole.getName()));
    }
}
