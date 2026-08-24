package com.adrgastin.banking.exception;

import lombok.Getter;

public class DuplicateResourceException extends RuntimeException {
    @Getter
    private final String resourceType;

    public DuplicateResourceException(String resourceType, Throwable cause) {
        super(resourceType + " already exists", cause);
        this.resourceType = resourceType;
    }
}
