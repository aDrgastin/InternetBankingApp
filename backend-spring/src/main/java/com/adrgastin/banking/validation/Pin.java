package com.adrgastin.banking.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * The annotated element must have a valid PIN structure and pass the ISO 7064, MOD 11-10 algorithm
 */
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PinValidator.class)
public @interface Pin {
    String message() default "Invalid PIN";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
