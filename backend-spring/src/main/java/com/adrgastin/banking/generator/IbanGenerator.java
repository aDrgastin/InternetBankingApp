package com.adrgastin.banking.generator;

import com.adrgastin.banking.account.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigInteger;
import java.security.SecureRandom;

@Component
@RequiredArgsConstructor
public class IbanGenerator {
    @Value("${banking.account.country-code:HR}")
    private String COUNTRY_CODE;
    @Value("${banking.account.bank-code:1234567}")
    private String BANK_CODE;
    @Value("${banking.account.account-length:10}")
    private int ACCOUNT_LENGTH;
    private static final SecureRandom random = new SecureRandom();
    private final AccountRepository accountRepository;

    public String generate() {
        String iban;
        do {
            String bban = BANK_CODE + randomDigits(ACCOUNT_LENGTH);
            String checkDigits = calculateCheckDigits(bban);
            iban = COUNTRY_CODE + checkDigits +  bban;
        } while (accountRepository.existsByIban(iban));
        return iban;
    }

    private String randomDigits(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }

    private String calculateCheckDigits(String bban) {
        String rearranged = bban + COUNTRY_CODE + "00";
        StringBuilder numeric = new StringBuilder();
        for (char c : rearranged.toCharArray()) {
            numeric.append(Character.isDigit(c) ? c : Character.getNumericValue(c));
        }
        BigInteger remainder = new BigInteger(numeric.toString()).mod(BigInteger.valueOf(97));
        int checkDigits = 98 - remainder.intValue();
        return String.format("%02d", checkDigits);
    }
}
