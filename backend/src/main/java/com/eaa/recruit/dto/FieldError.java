package com.eaa.recruit.dto;

/**
 * Single field-level validation error returned inside ApiResponse.errors.
 */
public record FieldError(String field, String message) {
}
