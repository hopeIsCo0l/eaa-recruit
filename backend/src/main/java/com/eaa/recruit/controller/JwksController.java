package com.eaa.recruit.controller;

import com.eaa.recruit.security.JwtTokenProvider;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigInteger;
import java.security.interfaces.RSAPublicKey;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.Map;

/**
 * Exposes the RSA public key as a JSON Web Key Set (JWKS) so peer services
 * (exam engine, etc.) can verify JWT signatures without sharing the secret.
 *
 * GET /api/v1/auth/.well-known/jwks.json — public, no auth required.
 */
@RestController
@RequestMapping("/api/v1/auth/.well-known")
public class JwksController {

    private final JwtTokenProvider jwtTokenProvider;

    public JwksController(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @GetMapping("/jwks.json")
    public Map<String, Object> getJwks() {
        RSAPublicKey pub = jwtTokenProvider.getPublicKey();
        Map<String, String> jwk = Map.of(
                "kty", "RSA",
                "use", "sig",
                "alg", "RS256",
                "kid", "eaa-recruit-1",
                "n",   b64url(unsignedBytes(pub.getModulus())),
                "e",   b64url(unsignedBytes(pub.getPublicExponent()))
        );
        return Map.of("keys", List.of(jwk));
    }

    private static byte[] unsignedBytes(BigInteger value) {
        byte[] bytes = value.toByteArray();
        // BigInteger.toByteArray() may prefix with 0x00 for positive numbers
        return (bytes[0] == 0 && bytes.length > 1)
                ? Arrays.copyOfRange(bytes, 1, bytes.length)
                : bytes;
    }

    private static String b64url(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
