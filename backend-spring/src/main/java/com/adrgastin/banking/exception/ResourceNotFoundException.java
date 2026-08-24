package com.adrgastin.banking.exception;

import lombok.Getter;

public class ResourceNotFoundException extends RuntimeException {
    @Getter
    private final String resourceType;

    public ResourceNotFoundException(String resourceType, Object identifier) {
        super(resourceType + " not found: " +  identifier);
        this.resourceType = resourceType;
    }
}
