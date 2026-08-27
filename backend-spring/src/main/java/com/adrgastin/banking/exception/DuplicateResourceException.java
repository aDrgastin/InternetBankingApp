package com.adrgastin.banking.exception;

import lombok.Getter;

public class DuplicateResourceException extends RuntimeException {
    @Getter
    private final String resourceType;

    public DuplicateResourceException(String resourceType, String message, Throwable cause) {
        super(message, cause);
        this.resourceType = resourceType;
    }
}
