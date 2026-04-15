package com.eaa.recruit.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.List;

/**
 * Standard API envelope for all responses.
 *
 * Success shape: { status, message, data, timestamp }
 * Error shape:   { status, message, errors, timestamp }
 *
 * Fields are omitted from JSON when null (@JsonInclude.NON_NULL).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
        String status,
        String message,
        T data,
        List<FieldError> errors,
        Instant timestamp
) {
    // ── success factories ────────────────────────────────────────────────────

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>("success", null, data, null, Instant.now());
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>("success", message, data, null, Instant.now());
    }

    public static ApiResponse<Void> success(String message) {
        return new ApiResponse<>("success", message, null, null, Instant.now());
    }

    // ── error factories ──────────────────────────────────────────────────────

    public static ApiResponse<Void> error(String message) {
        return new ApiResponse<>("error", message, null, null, Instant.now());
    }

    public static ApiResponse<Void> error(String message, List<FieldError> errors) {
        return new ApiResponse<>("error", message, null, errors, Instant.now());
    }
}
