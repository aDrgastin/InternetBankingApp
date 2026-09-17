package com.adrgastin.banking.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * The annotated element must have a valid IBAN structure and pass the MOD-97 checksum algorithm
 */
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = IbanValidator.class)
public @interface Iban {
    String message() default "Invalid IBAN";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
