-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema internet_banking
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema internet_banking
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `internet_banking` DEFAULT CHARACTER SET utf8mb4 ;
USE `internet_banking` ;

-- -----------------------------------------------------
-- Table `User`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `User` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `pin` CHAR(11) NOT NULL,
  `username` VARCHAR(45) NOT NULL,
  `password` CHAR(128) NOT NULL,
  `salt` CHAR(32) NOT NULL,
  `first_name` VARCHAR(255) NOT NULL,
  `last_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(75) NOT NULL,
  `role` ENUM('ADMIN', 'MOD', 'USER') NOT NULL DEFAULT 'USER',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `pin_UNIQUE` (`pin` ASC) VISIBLE,
  UNIQUE INDEX `username_UNIQUE` (`username` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `AccountType`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `AccountType` (
  `id` TINYINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Account`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Account` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `iban` CHAR(21) NOT NULL,
  `balance` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `status` ENUM('ACTIVE', 'CLOSED') NOT NULL DEFAULT 'ACTIVE',
  `type_id` TINYINT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `iban_UNIQUE` (`iban` ASC) VISIBLE,
  INDEX `fk_accounts_accountType1_idx` (`type_id` ASC) VISIBLE,
  CONSTRAINT `fk_accounts_accountType1`
    FOREIGN KEY (`type_id`)
    REFERENCES `AccountType` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `TransactionType`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `TransactionType` (
  `id` TINYINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Transaction`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Transaction` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `reference` CHAR(36) NOT NULL,
  `type_id` TINYINT NOT NULL,
  `from_account_id` INT NULL,
  `from_iban` CHAR(21) NULL,
  `to_account_id` INT NULL,
  `to_iban` CHAR(21) NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `status` ENUM('PENDING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'COMPLETED',
  `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `description` VARCHAR(255) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `reference_UNIQUE` (`reference` ASC) VISIBLE,
  INDEX `fk_transactions_accounts1_idx` (`from_account_id` ASC) VISIBLE,
  INDEX `fk_transactions_accounts2_idx` (`to_account_id` ASC) VISIBLE,
  INDEX `fk_transactions_transactionType1_idx` (`type_id` ASC) VISIBLE,
  INDEX `idx_transaction_timestamp` (`timestamp` DESC) VISIBLE,
  CONSTRAINT `fk_transactions_accounts1`
    FOREIGN KEY (`from_account_id`)
    REFERENCES `Account` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_transactions_accounts2`
    FOREIGN KEY (`to_account_id`)
    REFERENCES `Account` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_transactions_transactionType1`
    FOREIGN KEY (`type_id`)
    REFERENCES `TransactionType` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `UserAccount`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `UserAccount` (
  `user_id` INT NOT NULL,
  `account_id` INT NOT NULL,
  PRIMARY KEY (`user_id`, `account_id`),
  INDEX `fk_users_has_accounts_accounts1_idx` (`account_id` ASC) VISIBLE,
  INDEX `fk_users_has_accounts_users1_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_users_has_accounts_users1`
    FOREIGN KEY (`user_id`)
    REFERENCES `User` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_users_has_accounts_accounts1`
    FOREIGN KEY (`account_id`)
    REFERENCES `Account` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `AuditLog`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `AuditLog` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `table_name` VARCHAR(45) NOT NULL,
  `action` ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
  `record_id` INT NOT NULL,
  `changed_by` INT NULL,
  `old_data` JSON NULL,
  `new_data` JSON NULL,
  `changed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_table_record` (`record_id` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Card`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Card` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `account_id` INT NOT NULL,
  `card_number` CHAR(16) NOT NULL,
  `card_type` ENUM('DEBIT', 'CREDIT') NOT NULL DEFAULT 'DEBIT',
  `status` ENUM('ACTIVE', 'BLOCKED', 'EXPIRED') NOT NULL DEFAULT 'ACTIVE',
  `expiry_date` DATE NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_Card_Account1_idx` (`account_id` ASC) VISIBLE,
  UNIQUE INDEX `card_number_UNIQUE` (`card_number` ASC) VISIBLE,
  CONSTRAINT `fk_Card_Account1`
    FOREIGN KEY (`account_id`)
    REFERENCES `Account` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

USE `internet_banking` ;

-- -----------------------------------------------------
-- Placeholder table for view `vw_account_details`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `vw_account_details` (`id` INT, `iban` INT, `balance` INT, `status` INT, `type` INT, `createdAt` INT, `userId` INT);

-- -----------------------------------------------------
-- Placeholder table for view `vw_transaction_details`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `vw_transaction_details` (`id` INT, `reference` INT, `type` INT, `fromIban` INT, `toIban` INT, `amount` INT, `status` INT, `timestamp` INT, `description` INT);

-- -----------------------------------------------------
-- Placeholder table for view `vw_card_details`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `vw_card_details` (`id` INT, `accountId` INT, `iban` INT, `balance` INT, `accountStatus` INT, `accountType` INT, `accountCreatedAt` INT, `cardNumber` INT, `cardType` INT, `cardStatus` INT, `expiryDate` INT, `createdAt` INT);

-- -----------------------------------------------------
-- Placeholder table for view `vw_user_transactions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `vw_user_transactions` (`userId` INT, `accountId` INT, `id` INT, `reference` INT, `type` INT, `fromAccountId` INT, `fromIban` INT, `toAccountId` INT, `toIban` INT, `amount` INT, `status` INT, `timestamp` INT, `description` INT);

-- -----------------------------------------------------
-- Placeholder table for view `vw_account_transactions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `vw_account_transactions` (`id` INT, `reference` INT, `TYPE` INT, `fromAccountId` INT, `fromIban` INT, `toAccountId` INT, `toIban` INT, `amount` INT, `status` INT, `TIMESTAMP` INT, `DESCRIPTION` INT);

-- -----------------------------------------------------
-- procedure sp_transfer_funds
-- -----------------------------------------------------

DELIMITER $$
USE `internet_banking`$$
CREATE PROCEDURE `sp_transfer_funds` (IN from_acc_id INT, IN to_acc_id INT, IN amount DECIMAL(12,2), IN description VARCHAR(255))
BEGIN
	DECLARE v_balance_from DECIMAL(12,2);
    DECLARE v_status_from, v_status_to VARCHAR(10);
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		ROLLBACK;
        -- SET AUTOCOMMIT = 1;
		RESIGNAL;
	END;
    
    -- SET AUTOCOMMIT = 0;
	START TRANSACTION;
	SELECT balance, status INTO v_balance_from, v_status_from FROM Account WHERE id = from_acc_id FOR UPDATE;
	SELECT status INTO v_status_to FROM Account WHERE id = to_acc_id FOR UPDATE;
	
	IF v_status_from = 'CLOSED' THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'SOURCE_ACCOUNT_CLOSED';
	END IF;
    IF v_status_to = 'CLOSED' THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'DESTINATION_ACCOUNT_CLOSED';
	END IF;
	IF v_balance_from < amount THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'INSUFFICIENT_FUNDS';
	END IF;
	
	UPDATE Account SET balance = balance - amount WHERE id = from_acc_id;
	UPDATE Account SET balance = balance + amount WHERE id = to_acc_id;
	
	INSERT INTO Transaction (reference, type_id, from_account_id, to_account_id, from_iban, to_iban, status, amount, description)
		VALUES (UUID(), (SELECT id FROM TransactionType WHERE name = 'TRANSFER'), from_acc_id, to_acc_id, (SELECT iban FROM Account WHERE id = from_acc_id), (SELECT iban FROM Account WHERE id = to_acc_id), 'COMPLETED', amount, description);
	COMMIT;
	-- SET AUTOCOMMIT = 1;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure sp_pos_payout
-- -----------------------------------------------------

DELIMITER $$
USE `internet_banking`$$
CREATE PROCEDURE `sp_pos_payout` (IN from_acc_id INT, IN to_acc_id INT, IN amount DECIMAL(12,2), IN description VARCHAR(255))
BEGIN
	DECLARE v_from_status, v_to_status CHAR(10);
    DECLARE v_balance DECIMAL(12,2);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    SELECT balance, status INTO v_balance, v_from_status FROM Account WHERE id = from_acc_id FOR UPDATE;
    SELECT status INTO v_to_status FROM Account WHERE id = to_acc_id FOR UPDATE;
    
    IF v_from_status = 'CLOSED' THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'SOURCE_ACCOUNT_CLOSED';
	END IF;
    IF v_to_status = 'CLOSED' THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'DESTINATION_ACCOUNT_CLOSED';
	END IF;
    IF v_balance < amount THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'INSUFFICIENT_FUNDS';
	END IF;
    
    UPDATE Account SET balance = balance - amount WHERE id = from_acc_id;
    UPDATE Account SET balance = balance + amount WHERE id = to_acc_id;
    INSERT INTO Transaction (reference, type_id, from_account_id, from_iban, to_account_id, to_iban, amount, status, description)
		VALUES (UUID(), (SELECT id FROM TransactionType WHERE name = 'POS'),
			from_acc_id, (SELECT iban FROM Account WHERE id = from_acc_id),
            to_acc_id, (SELECT iban FROM Account WHERE id = to_acc_id),
            amount, 'COMPLETED', description);
    COMMIT;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure sp_withdraw_funds
-- -----------------------------------------------------

DELIMITER $$
USE `internet_banking`$$
CREATE PROCEDURE `sp_withdraw_funds` (IN acc_id INT, IN amount DECIMAL(12,2), IN description VARCHAR(255))
BEGIN
	DECLARE v_balance DECIMAL(12,2);
    DECLARE v_status CHAR(10);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		ROLLBACK;
        RESIGNAL;
	END;
    
    START TRANSACTION;
    SELECT balance, status INTO v_balance, v_status FROM Account WHERE id = acc_id FOR UPDATE;
    IF v_status = 'CLOSED' THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ACCOUNT_CLOSED';
    END IF;
    IF v_balance < amount THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'INSUFFICIENT_FUNDS';
    END IF;
    
    UPDATE Account SET balance = balance - amount WHERE id = acc_id;
    INSERT INTO Transaction(reference, type_id, from_account_id, from_iban, amount, status, description)
		VALUES (UUID(), (SELECT id FROM TransactionType WHERE name = 'WITHDRAWAL'), acc_id, (SELECT iban FROM Account WHERE id = acc_id), amount, 'COMPLETED', description);
    COMMIT;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure sp_deposit_funds
-- -----------------------------------------------------

DELIMITER $$
USE `internet_banking`$$
CREATE PROCEDURE `sp_deposit_funds` (IN acc_id INT, IN amount DECIMAL(12,2), IN description VARCHAR(255))
BEGIN
    DECLARE v_status CHAR(10);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		ROLLBACK;
        RESIGNAL;
	END;
    
    START TRANSACTION;
    SELECT status INTO v_status FROM Account WHERE id = acc_id FOR UPDATE;
    IF v_status = 'CLOSED' THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ACCOUNT_CLOSED';
    END IF;
    
    UPDATE Account SET balance = balance + amount WHERE id = acc_id;
    INSERT INTO Transaction(reference, type_id, to_account_id, to_iban, amount, status, description)
		VALUES (UUID(), (SELECT id FROM TransactionType WHERE name = 'DEPOSIT'), acc_id, (SELECT iban FROM Account WHERE id = acc_id), amount, 'COMPLETED', description);
    COMMIT;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- View `vw_account_details`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `vw_account_details`;
USE `internet_banking`;
CREATE OR REPLACE VIEW `vw_account_details` AS
	SELECT a.id, iban, balance, status, at.name AS type, a.created_at AS createdAt, u.id AS userId
    FROM Account a JOIN UserAccount ua ON a.id = ua.account_id
    JOIN User u ON ua.user_id = u.id
    JOIN AccountType at ON a.type_id = at.id;
    -- WHERE a.id = ?;

-- -----------------------------------------------------
-- View `vw_transaction_details`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `vw_transaction_details`;
USE `internet_banking`;
CREATE OR REPLACE VIEW `vw_transaction_details` AS
	SELECT t.id, reference, tt.name AS type, from_iban AS fromIban, to_iban AS toIban, amount, status, timestamp, description
	FROM Transaction t JOIN TransactionType tt ON t.type_id = tt.id;
	-- WHERE from_account_id = ? OR from_iban = ?;

-- -----------------------------------------------------
-- View `vw_card_details`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `vw_card_details`;
USE `internet_banking`;
CREATE  OR REPLACE VIEW `vw_card_details` AS
	SELECT c.id, account_id AS accountId, a.iban, a.balance, a.status AS accountStatus, at.name AS accountType, a.created_at AS accountCreatedAt, card_number AS cardNumber, card_type AS cardType, c.status AS cardStatus, expiry_date AS expiryDate, c.created_at AS createdAt
    FROM Card c JOIN Account a ON c.account_id = a.id
    JOIN AccountType at ON a.type_id = at.id;
    -- WHERE c.id = ?;

-- -----------------------------------------------------
-- View `vw_user_transactions`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `vw_user_transactions`;
USE `internet_banking`;
CREATE  OR REPLACE VIEW `vw_user_transactions` AS
	SELECT ua.user_id AS userId, ua.account_id AS accountId, t.id, reference, tt.name AS type, from_account_id AS fromAccountId, from_iban AS fromIban, to_account_id AS toAccountId, to_iban AS toIban, amount, t.status, timestamp, description
	FROM Transaction t JOIN Account a ON t.from_account_id = a.id OR t.to_account_id = a.id
    JOIN UserAccount ua ON a.id = ua.account_id
    JOIN TransactionType tt ON t.type_id = tt.id;
    -- WHERE userId = ? ORDER BY timestamp DESC;

-- -----------------------------------------------------
-- View `vw_account_transactions`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `vw_account_transactions`;
USE `internet_banking`;
CREATE  OR REPLACE VIEW `vw_account_transactions` AS
	SELECT t.id, reference, tt.name AS TYPE, from_account_id AS fromAccountId, from_iban AS fromIban, to_account_id AS toAccountId, to_iban AS toIban, amount, t.status, TIMESTAMP, DESCRIPTION
	FROM TRANSACTION t JOIN TransactionType tt ON t.type_id = tt.id;
    -- WHERE t.from_account_id = 2 OR t.to_account_id = 2
    -- ORDER BY TIMESTAMP DESC;
USE `internet_banking`;

DELIMITER $$
USE `internet_banking`$$
CREATE DEFINER = CURRENT_USER TRIGGER `internet_banking`.`trg_user_insert` AFTER INSERT ON `User` FOR EACH ROW
BEGIN
	INSERT INTO AuditLog(table_name, action, record_id, new_data) VALUES('User', 'INSERT', NEW.id, JSON_OBJECT(
		'pin', NEW.pin, 'username', NEW.username, 'firstName', NEW.first_name, 'lastName', NEW.last_name, 'email', NEW.email
    ));
END$$

USE `internet_banking`$$
CREATE DEFINER = CURRENT_USER TRIGGER `internet_banking`.`trg_account_insert` AFTER INSERT ON `Account` FOR EACH ROW
BEGIN
	INSERT INTO AuditLog(table_name, action, record_id, new_data) VALUES ('Account', 'INSERT', NEW.id, JSON_OBJECT(
		'iban', NEW.iban,
        'balance', NEW.balance
    ));
END$$

USE `internet_banking`$$
CREATE DEFINER = CURRENT_USER TRIGGER `internet_banking`.`trg_account_balance_update` AFTER UPDATE ON `Account` FOR EACH ROW
BEGIN
	IF OLD.balance <> NEW.balance OR OLD.status <> NEW.status THEN
		INSERT INTO AuditLog(table_name, action, record_id, changed_by, old_data, new_data) VALUES('Account', 'UPDATE', NEW.id, @session_user_id, JSON_OBJECT(
			'balance', OLD.balance, 'status', OLD.status
        ), JSON_OBJECT(
			'balance', NEW.balance, 'status', NEW.status
        ));
	END IF;
END$$

USE `internet_banking`$$
CREATE DEFINER = CURRENT_USER TRIGGER `internet_banking`.`trg_transaction_insert` AFTER INSERT ON `Transaction` FOR EACH ROW
BEGIN
	INSERT INTO AuditLog(table_name, action, record_id, new_data) VALUES('Transaction', 'INSERT', NEW.id, JSON_OBJECT(
		'reference', NEW.reference,
        'amount', NEW.amount,
        'status', NEW.status,
        'fromIban', NEW.from_iban,
        'toIban', NEW.to_iban
    ));
END$$


DELIMITER ;
CREATE USER 'banking_app'@'localhost' IDENTIFIED BY 'bankend';

GRANT EXECUTE ON procedure `internet_banking`.`sp_transfer_funds` TO 'banking_app'@'localhost';
GRANT SELECT ON TABLE `internet_banking`.`vw_transaction_details` TO 'banking_app'@'localhost';
GRANT SELECT ON TABLE `internet_banking`.`vw_account_details` TO 'banking_app'@'localhost';
GRANT UPDATE, SELECT, INSERT ON TABLE `internet_banking`.`Account` TO 'banking_app'@'localhost';
GRANT SELECT ON TABLE `internet_banking`.`AccountType` TO 'banking_app'@'localhost';
GRANT SELECT ON TABLE `internet_banking`.`AuditLog` TO 'banking_app'@'localhost';
GRANT SELECT, INSERT, UPDATE ON TABLE `internet_banking`.`Card` TO 'banking_app'@'localhost';
GRANT SELECT, INSERT ON TABLE `internet_banking`.`Transaction` TO 'banking_app'@'localhost';
GRANT SELECT ON TABLE `internet_banking`.`TransactionType` TO 'banking_app'@'localhost';
GRANT UPDATE, SELECT, INSERT ON TABLE `internet_banking`.`User` TO 'banking_app'@'localhost';
GRANT SELECT ON TABLE `internet_banking`.`UserAccount` TO 'banking_app'@'localhost';
GRANT SELECT ON TABLE `internet_banking`.`vw_card_details` TO 'banking_app'@'localhost';
GRANT SELECT ON TABLE `internet_banking`.`vw_user_transactions` TO 'banking_app'@'localhost';
GRANT EXECUTE ON procedure `internet_banking`.`sp_deposit_funds` TO 'banking_app'@'localhost';
GRANT EXECUTE ON procedure `internet_banking`.`sp_withdraw_funds` TO 'banking_app'@'localhost';
GRANT EXECUTE ON procedure `internet_banking`.`sp_pos_payout` TO 'banking_app'@'localhost';
GRANT SELECT ON TABLE `internet_banking`.`vw_account_transactions` TO 'banking_app'@'localhost';

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

-- -----------------------------------------------------
-- Data for table `User`
-- -----------------------------------------------------
START TRANSACTION;
USE `internet_banking`;
INSERT INTO `User` (`id`, `pin`, `username`, `password`, `salt`, `first_name`, `last_name`, `email`, `role`, `created_at`) VALUES (DEFAULT, '01234567890', 'admin', '7d838ed08cd6740b2d35196129b74252dc5b6345ea150ced4de5681d1d827b7a51e2669a63e1c1da1ba8d919925853784caedae5ae47345cde60ff2c603ef1a2', '86bdb9f54795c07133876993872a6f30', 'Admin', 'Admin', 'admin@mail.com', 'ADMIN', DEFAULT);
INSERT INTO `User` (`id`, `pin`, `username`, `password`, `salt`, `first_name`, `last_name`, `email`, `role`, `created_at`) VALUES (DEFAULT, '01234567891', 'pero', '0ded42c793cb81e8bf69fc9d090dfb764023ca537937d873ffb6790d82491b55bca6e0aeebc71cc4a9c0d7ffef3e310093ca6ccce0967d2ce59a55fdb026bc39', '61f942cedd8cda4022b319cb6b26d521', 'Pero', 'Perić', 'pero@mail.com', 'USER', DEFAULT);
INSERT INTO `User` (`id`, `pin`, `username`, `password`, `salt`, `first_name`, `last_name`, `email`, `role`, `created_at`) VALUES (DEFAULT, '01234567892', 'djuro', '00fa473c73f8ad5169e8b0e87042fa86663e4db6688fcf072870a29e733b5bd6eec55c411c2b969fa98941a2e3031d924e2d7cd534bbba10dcc06caa108c249b', '67e4270afdc8f88adfde2435641097c0', 'Đuro', 'Đurić', 'djuro@mail.com', 'USER', DEFAULT);

COMMIT;


-- -----------------------------------------------------
-- Data for table `AccountType`
-- -----------------------------------------------------
START TRANSACTION;
USE `internet_banking`;
INSERT INTO `AccountType` (`id`, `name`) VALUES (DEFAULT, 'CHECKING');
INSERT INTO `AccountType` (`id`, `name`) VALUES (DEFAULT, 'SAVINGS');

COMMIT;


-- -----------------------------------------------------
-- Data for table `Account`
-- -----------------------------------------------------
START TRANSACTION;
USE `internet_banking`;
INSERT INTO `Account` (`id`, `iban`, `balance`, `status`, `type_id`, `created_at`) VALUES (DEFAULT, 'HR1234567890123456789', 5000.00, 'ACTIVE', 1, DEFAULT);
INSERT INTO `Account` (`id`, `iban`, `balance`, `status`, `type_id`, `created_at`) VALUES (DEFAULT, 'HR1234567890123456790', 2000, 'ACTIVE', 1, DEFAULT);

COMMIT;


-- -----------------------------------------------------
-- Data for table `TransactionType`
-- -----------------------------------------------------
START TRANSACTION;
USE `internet_banking`;
INSERT INTO `TransactionType` (`id`, `name`) VALUES (DEFAULT, 'DEPOSIT');
INSERT INTO `TransactionType` (`id`, `name`) VALUES (DEFAULT, 'WITHDRAWAL');
INSERT INTO `TransactionType` (`id`, `name`) VALUES (DEFAULT, 'TRANSFER');
INSERT INTO `TransactionType` (`id`, `name`) VALUES (DEFAULT, 'POS');
INSERT INTO `TransactionType` (`id`, `name`) VALUES (DEFAULT, 'FEE');

COMMIT;


-- -----------------------------------------------------
-- Data for table `UserAccount`
-- -----------------------------------------------------
START TRANSACTION;
USE `internet_banking`;
INSERT INTO `UserAccount` (`user_id`, `account_id`) VALUES (2, 1);
INSERT INTO `UserAccount` (`user_id`, `account_id`) VALUES (3, 2);

COMMIT;


-- -----------------------------------------------------
-- Data for table `Card`
-- -----------------------------------------------------
START TRANSACTION;
USE `internet_banking`;
INSERT INTO `Card` (`id`, `account_id`, `card_number`, `card_type`, `status`, `expiry_date`, `created_at`) VALUES (DEFAULT, 1, '1234567890123456', 'DEBIT', 'ACTIVE', '2029-04-28', DEFAULT);
INSERT INTO `Card` (`id`, `account_id`, `card_number`, `card_type`, `status`, `expiry_date`, `created_at`) VALUES (DEFAULT, 1, '1234567890123457', 'CREDIT', 'ACTIVE', '2029-04-30', DEFAULT);

COMMIT;

