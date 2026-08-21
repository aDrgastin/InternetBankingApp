package com.adrgastin.banking.user;

import com.adrgastin.banking.support.AbstractRepositoryTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import static org.assertj.core.api.Assertions.assertThat;

import java.util.Optional;

public class AppUserRepositoryTest extends AbstractRepositoryTest {
    @Autowired
    AppUserRepository appUserRepository;

    @Nested
    @DisplayName("findByUsername")
    class FindByUsername {
        @Test
        @DisplayName("returns user when username exists")
        void success() {
            AppUser user = new AppUser();
            user.setPin("12345678901");
            user.setUsername("Pero");
            user.setPassword("password");
            user.setFirstName("Pero");
            user.setLastName("Perić");
            user.setEmail("pperic@mail.com");
            appUserRepository.save(user);

            Optional<AppUser> result = appUserRepository.findByUsername(user.getUsername());

            assertThat(result).isPresent();
            assertThat(result.get().getUsername()).isEqualTo(user.getUsername());
        }

        @Test
        @DisplayName("returns empty when username doesn't exist")
        void notFound() {
            Optional<AppUser> result = appUserRepository.findByUsername("notExists");
            assertThat(result).isEmpty();
        }
    }
}
