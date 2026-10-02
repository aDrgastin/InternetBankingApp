package com.adrgastin.banking.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.regex.Pattern;

public class PinValidator implements ConstraintValidator<Pin, String> {
    private static final Pattern PATTERN = Pattern.compile("^\\d{11}$");

    @Override
    public boolean isValid(String pin, ConstraintValidatorContext context) {
        if (pin == null || pin.isBlank()) return true;
        if (!PATTERN.matcher(pin).matches()) return false;

        int a = 10;
        for (int i = 0; i < 10; i++) {
            a = (a + (pin.charAt(i) - '0')) % 10;
            if (a == 0) a = 10;
            a = (a * 2) % 11;
        }
        int control = (11 - a) % 10;
        return control == pin.charAt(10) - '0';
    }
}
