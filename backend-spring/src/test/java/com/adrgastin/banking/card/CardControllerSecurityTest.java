package com.adrgastin.banking.card;

import com.adrgastin.banking.security.AppUserDetails;
import com.adrgastin.banking.security.JwtTokenProvider;
import com.adrgastin.banking.security.SecurityConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CardController.class)
@Import(SecurityConfig.class)
public class CardControllerSecurityTest {
    @Autowired
    private MockMvc mockMvc;
    @MockitoBean
    private CardService cardService;
    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;
    @MockitoBean
    private UserDetailsService userDetailsService;

    private static AppUserDetails principal(int id, String... roles) {
        return new AppUserDetails(id, "u" + id, Arrays.stream(roles).map(SimpleGrantedAuthority::new).toList());
    }

    @Nested
    @DisplayName("GET /cards/my")
    class GetMyCards {
        @Test
        void unauthenticated() throws Exception {
            mockMvc.perform(get("/cards/my"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        void authenticated() throws Exception {
            mockMvc.perform(get("/cards/my")
                        .with(user(principal(5, "ROLE_USER"))))
                    .andExpect(status().isOk());
            verify(cardService).getAllByUserId(5);
        }
    }

    @Nested
    @DisplayName("GET /cards/{id}")
    class GetById {
        @Test
        void userIsNotPrivileged() throws Exception {
            mockMvc.perform(get("/cards/{id}", 1)
                        .with(user(principal(5, "ROLE_USER"))))
                    .andExpect(status().isOk());
            verify(cardService).getById(1, 5, false);
        }

        @Test
        void privilegedUser() throws Exception {
            mockMvc.perform(get("/cards/{id}", 1)
                        .with(user(principal(5, "ROLE_MOD"))))
                    .andExpect(status().isOk());
            verify(cardService).getById(1, 5, true);
        }
    }

    @Nested
    @DisplayName("POST /cards")
    class Create {
        private static final String BODY = "{\"accountId\":1,\"type\":\"DEBIT\"}";

        @Test
        void userForbidden() throws Exception {
            mockMvc.perform(post("/cards")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(BODY)
                        .with(user(principal(5, "ROLE_USER"))))
                    .andExpect(status().isForbidden())
                    .andExpect(jsonPath("$.errorCode").value("ACCESS_DENIED"));
            verifyNoInteractions(cardService);
        }

        @Test
        void allowedUser() throws Exception {
            mockMvc.perform(post("/cards")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(BODY)
                        .with(user(principal(1, "ROLE_ADMIN"))))
                    .andExpect(status().is2xxSuccessful());
            verify(cardService).create(any(CreateCardCommand.class), eq(1));
        }
    }

    @Nested
    @DisplayName("PATCH /cards/{id}/status")
    class UpdateStatus {
        private static final String BODY = "{\"status\":\"BLOCKED\"}";

        @Test
        void unauthenticated() throws Exception {
            mockMvc.perform(patch("/cards/{id}/status", 1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(BODY))
                    .andExpect(status().isUnauthorized());
            verifyNoInteractions(cardService);
        }

        @Test
        void userPassesNotPrivileged() throws Exception {
            mockMvc.perform(patch("/cards/{id}/status", 1)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(BODY)
                    .with(user(principal(5, "ROLE_USER"))))
                    .andExpect(status().isOk());
            verify(cardService).updateStatus(eq(1), any(UpdateCardStatusCommand.class), eq(5), eq(false));
        }
    }
}
