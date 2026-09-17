package com.adrgastin.banking.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.math.BigInteger;
import java.util.regex.Pattern;

public class IbanValidator implements ConstraintValidator<Iban, String> {
    private static final Pattern IBAN_PATTERN = Pattern.compile("^[A-Z]{2}\\d{2}[A-Z0-9]{1,30}$");

    @Override
    public boolean isValid(String iban, ConstraintValidatorContext context) {
        if (iban == null || iban.isBlank()) return true;

        String cleaned = iban.replace(" ", "").toUpperCase();
        if (!IBAN_PATTERN.matcher(cleaned).matches()) return false;

        return isValidChecksum(cleaned);
    }

    private boolean isValidChecksum(String iban) {
        String rearranged = iban.substring(4) + iban.substring(0, 4);
        StringBuilder numeric =  new StringBuilder();
        for (char c : rearranged.toCharArray()) {
            numeric.append(Character.isDigit(c) ? c : Character.getNumericValue(c));
        }
        BigInteger value =  new BigInteger(numeric.toString());
        return value.mod(BigInteger.valueOf(97)).intValue() == 1;
    }
}
