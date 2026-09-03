package com.adrgastin.banking.generator;

import com.adrgastin.banking.card.CardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
@RequiredArgsConstructor
public class CardNumberGenerator {
    @Value("${banking.card.bin:440000}")
    private String BIN;
    @Value("${banking.card.account-length:9}")
    private int ACCOUNT_LENGTH;
    private static final SecureRandom random = new SecureRandom();

    private final CardRepository cardRepository;

    public String generate() {
        String number;
        do {
            String partial = BIN + randomDigits(ACCOUNT_LENGTH);
            int checkDigit = calculateLuhnCheckDigit(partial);
            number = partial + checkDigit;
        } while (cardRepository.existsByCardNumber(number));
        return number;
    }

    private String randomDigits(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }

    private int calculateLuhnCheckDigit(String numberWithoutCheckDigit) {
        int sum = 0;
        boolean alternate = true;
        for (int i = numberWithoutCheckDigit.length() - 1; i >= 0; i--) {
            int digit = Character.getNumericValue(numberWithoutCheckDigit.charAt(i));
            if (alternate) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            sum += digit;
            alternate = !alternate;
        }
        return (10 - (sum % 10)) % 10;
    }
}
