package com.eaa.recruit.security;

/**
 * Immutable principal stored in the SecurityContext after JWT validation.
 * Carries only the claims extracted from the token — no DB lookup needed per request.
 */
public record AuthenticatedUser(Long id, String email, String role) {
}
