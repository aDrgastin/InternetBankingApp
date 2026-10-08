CREATE TABLE IF NOT EXISTS app_user (
    id              INT NOT NULL AUTO_INCREMENT,
    pin             CHAR(11) NOT NULL,
    username        VARCHAR(45) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    first_name      VARCHAR(255) NOT NULL,
    last_name       VARCHAR(255) NOT NULL,
    email           VARCHAR(75) NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE INDEX uq_app_user_pin (pin),
    UNIQUE INDEX uq_app_user_username (username)
) ENGINE = InnoDB;


CREATE TABLE IF NOT EXISTS role (
    id      TINYINT NOT NULL AUTO_INCREMENT,
    name    VARCHAR(50) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_role_name (name)
) ENGINE = InnoDB;


CREATE TABLE IF NOT EXISTS user_role (
    user_id INT NOT NULL,
    role_id TINYINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_role_user FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_role_role FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE CASCADE
) ENGINE = InnoDB;


CREATE TABLE IF NOT EXISTS refresh_token (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    token_hash VARCHAR(64) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (id),
    CONSTRAINT fk_refresh_token_user FOREIGN KEY (user_id) REFERENCES app_user(id),
    UNIQUE INDEX uq_refresh_token_token_hash (token_hash)
) ENGINE = InnoDB;


CREATE TABLE IF NOT EXISTS account_type (
    id      TINYINT NOT NULL AUTO_INCREMENT,
    name    VARCHAR(50) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE INDEX uq_account_type_name (name)
) ENGINE = InnoDB;


CREATE TABLE IF NOT EXISTS account (
    id          INT NOT NULL AUTO_INCREMENT,
    iban        CHAR(21) NOT NULL,
    balance     DECIMAL(12,2) NOT NULL DEFAULT 0,
    status      ENUM('ACTIVE', 'CLOSED', 'BLOCKED') NOT NULL DEFAULT 'ACTIVE',
    type_id     TINYINT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE INDEX uq_account_iban (iban),
    INDEX idx_account_type_id (type_id),
    CONSTRAINT `fk_account_account_type` FOREIGN KEY (type_id) REFERENCES account_type(id),
    CONSTRAINT `chk_positive_balance` CHECK (balance >= 0.0)
) ENGINE = InnoDB;


CREATE TABLE IF NOT EXISTS transaction_type (
    id      TINYINT NOT NULL AUTO_INCREMENT,
    name    VARCHAR(50) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE INDEX uq_transaction_type_name (name)
) ENGINE = InnoDB;


CREATE TABLE IF NOT EXISTS transaction (
    id              INT NOT NULL AUTO_INCREMENT,
    reference       CHAR(36) NOT NULL DEFAULT (UUID()),
    type_id         TINYINT NOT NULL,
    from_account_id INT,
    from_iban       CHAR(21),
    to_account_id   INT,
    to_iban         CHAR(21),
    amount          DECIMAL(12,2) NOT NULL,
    status          ENUM('PENDING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'COMPLETED',
    timestamp       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    description     VARCHAR(255),
    PRIMARY KEY (id),
    UNIQUE INDEX uq_transaction_reference (reference),
    INDEX idx_transaction_from_account (from_account_id),
    INDEX idx_transaction_to_account (to_account_id),
    INDEX idx_transaction_transaction_type (type_id),
    INDEX idx_transaction_timestamp (timestamp DESC),
    CONSTRAINT fk_transaction_from_account FOREIGN KEY (from_account_id) REFERENCES account(id),
    CONSTRAINT fk_transaction_to_account FOREIGN KEY (to_account_id) REFERENCES account(id),
    CONSTRAINT fk_transaction_transaction_type FOREIGN KEY (type_id) REFERENCES transaction_type(id),
    CONSTRAINT `chk_positive_amount` CHECK (amount > 0)
) ENGINE = InnoDB;


CREATE TABLE IF NOT EXISTS user_account (
    user_id     INT NOT NULL,
    account_id  INT NOT NULL,
    PRIMARY KEY (user_id, account_id),
    INDEX idx_user_account_account (account_id),
    INDEX idx_user_account_user (user_id),
    CONSTRAINT fk_user_account_user FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_account_account FOREIGN KEY (account_id) REFERENCES account(id) ON DELETE CASCADE
) ENGINE = InnoDB;


CREATE TABLE IF NOT EXISTS audit_log (
    id          INT NOT NULL AUTO_INCREMENT,
    table_name  VARCHAR(45) NOT NULL,
    action      ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    record_id   INT NOT NULL,
    changed_by  INT,
    old_data    JSON,
    new_data    JSON,
    changed_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_audit_log_record (record_id)
) ENGINE = InnoDB;


CREATE TABLE IF NOT EXISTS card (
    id          INT NOT NULL AUTO_INCREMENT,
    account_id  INT NOT NULL,
    card_number CHAR(16) NOT NULL,
    card_type   ENUM('DEBIT', 'CREDIT') NOT NULL DEFAULT 'DEBIT',
    status      ENUM('ACTIVE', 'BLOCKED', 'EXPIRED') NOT NULL DEFAULT 'ACTIVE',
    expiry_date DATE NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_card_account (account_id),
    UNIQUE INDEX uq_card_card_number (card_number),
    CONSTRAINT fk_card_account FOREIGN KEY (account_id) REFERENCES account(id)
) ENGINE = InnoDB;



DELIMITER $$
CREATE TRIGGER `trg_app_user_insert` AFTER INSERT ON `app_user` FOR EACH ROW
BEGIN
    INSERT INTO audit_log(table_name, action, record_id, new_data) VALUES('app_user', 'INSERT', NEW.id, JSON_OBJECT(
        'pin', NEW.pin,
        'username', NEW.username,
        'firstName', NEW.first_name,
        'lastName', NEW.last_name,
        'email', NEW.email
    ));
END$$

CREATE TRIGGER `trg_app_user_info_update` AFTER UPDATE ON `app_user` FOR EACH ROW
BEGIN
    INSERT INTO audit_log(table_name, action, record_id, changed_by, old_data, new_data) VALUES('app_user', 'INSERT', NEW.id, @session_user_id, JSON_OBJECT(
        'pin', OLD.pin,
        'username', OLD.username,
        'first_name', OLD.first_name,
        'last_name', OLD.last_name,
        'email', OLD.email), JSON_OBJECT(
        'pin', NEW.pin,
        'username', NEW.username,
        'first_name', NEW.first_name,
        'last_name', NEW.last_name,
        'email', NEW.email
    ));
END$$


CREATE TRIGGER `trg_account_insert` AFTER INSERT ON `account` FOR EACH ROW
BEGIN
    INSERT INTO audit_log(table_name, action, record_id, changed_by, new_data) VALUES ('account', 'INSERT', NEW.id, @session_user_id, JSON_OBJECT(
        'iban', NEW.iban,
        'balance', NEW.balance
    ));
END$$


CREATE TRIGGER `trg_account_balance_update` AFTER UPDATE ON `account` FOR EACH ROW
BEGIN
	IF OLD.balance <> NEW.balance OR OLD.status <> NEW.status THEN
		INSERT INTO audit_log(table_name, action, record_id, changed_by, old_data, new_data) VALUES('account', 'UPDATE', NEW.id, @session_user_id, JSON_OBJECT(
			'balance', OLD.balance, 'status', OLD.status
        ), JSON_OBJECT(
			'balance', NEW.balance, 'status', NEW.status
        ));
    END IF;
END$$


CREATE TRIGGER `trg_transaction_insert` AFTER INSERT ON `transaction` FOR EACH ROW
BEGIN
    INSERT INTO audit_log(table_name, action, record_id, new_data) VALUES('transaction', 'INSERT', NEW.id, JSON_OBJECT(
        'reference', NEW.reference,
        'amount', NEW.amount,
        'status', NEW.status,
        'fromIban', NEW.from_iban,
        'toIban', NEW.to_iban
    ));
END$$


CREATE TRIGGER `trg_card_insert` AFTER INSERT ON `card` FOR EACH ROW
BEGIN
    INSERT INTO audit_log(table_name, action, record_id, changed_by, new_data) VALUES('card', 'INSERT', NEW.id, @session_user_id, JSON_OBJECT(
        'card_number', NEW.card_number,
        'card_type', NEW.card_type,
        'expiry_date', NEW.expiry_date
    ));
END$$


CREATE TRIGGER `trg_card_update` AFTER UPDATE ON `card` FOR EACH ROW
BEGIN
    INSERT INTO audit_log(table_name, action, record_id, changed_by, old_data, new_data) VALUES('card', 'UPDATE', NEW.id, @session_user_id, JSON_OBJECT('status', OLD.status), JSON_OBJECT('status', NEW.status));
END$$

DELIMITER ;
