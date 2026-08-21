package com.adrgastin.banking.support;

import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Duration;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
public abstract class AbstractRepositoryTest {
    @Container
    @ServiceConnection
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:9.2")
            .withStartupTimeout(Duration.ofMinutes(4))
            .withCommand("mysqld", "--log-bin-trust-function-creators=1"); // org.testcontainers:mysql 9.7 sends legacy flag at startup which causes container to not initialize- https://github.com/testcontainers/testcontainers-java/issues/10184
}
