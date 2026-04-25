package com.eaa.recruit.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.SecurityException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);

    private static final String CLAIM_USER_ID = "userId";
    private static final String CLAIM_ROLE    = "role";

    private final JwtProperties  props;
    private final RSAPrivateKey  privateKey;
    private final RSAPublicKey   publicKey;

    public JwtTokenProvider(JwtProperties props) {
        this.props = props;
        if (!props.getPrivateKeyPem().isBlank() && !props.getPublicKeyPem().isBlank()) {
            this.privateKey = parsePrivateKey(props.getPrivateKeyPem());
            this.publicKey  = parsePublicKey(props.getPublicKeyPem());
            log.info("JWT RS256 keys loaded from configuration");
        } else {
            KeyPair kp  = generateEphemeralKeyPair();
            this.privateKey = (RSAPrivateKey) kp.getPrivate();
            this.publicKey  = (RSAPublicKey)  kp.getPublic();
            log.warn("JWT_PRIVATE_KEY_PEM / JWT_PUBLIC_KEY_PEM not set — " +
                     "using ephemeral RSA-2048 key pair. Tokens are invalid after restart. " +
                     "Set JWT_PRIVATE_KEY_PEM and JWT_PUBLIC_KEY_PEM for production.");
        }
    }

    /** Exposes the RSA public key for JWKS publication. */
    public RSAPublicKey getPublicKey() {
        return publicKey;
    }

    public String generateToken(Long userId, String role, String email) {
        Date now    = new Date();
        Date expiry = new Date(now.getTime() + props.getExpirationMs());

        return Jwts.builder()
                .subject(email)
                .claim(CLAIM_USER_ID, userId)
                .claim(CLAIM_ROLE, role)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(privateKey, Jwts.SIG.RS256)
                .compact();
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(publicKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    public Long extractUserId(String token) {
        return extractAllClaims(token).get(CLAIM_USER_ID, Long.class);
    }

    public String extractRole(String token) {
        return extractAllClaims(token).get(CLAIM_ROLE, String.class);
    }

    public boolean validateToken(String token) {
        try {
            extractAllClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.debug("JWT expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.debug("JWT unsupported: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.debug("JWT malformed: {}", e.getMessage());
        } catch (SecurityException e) {
            log.debug("JWT signature invalid: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.debug("JWT claims empty: {}", e.getMessage());
        }
        return false;
    }

    private static RSAPrivateKey parsePrivateKey(String pem) {
        try {
            byte[] der = Base64.getDecoder().decode(stripPemHeaders(pem));
            return (RSAPrivateKey) KeyFactory.getInstance("RSA")
                    .generatePrivate(new PKCS8EncodedKeySpec(der));
        } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
            throw new IllegalStateException("Cannot parse JWT_PRIVATE_KEY_PEM", e);
        }
    }

    private static RSAPublicKey parsePublicKey(String pem) {
        try {
            byte[] der = Base64.getDecoder().decode(stripPemHeaders(pem));
            return (RSAPublicKey) KeyFactory.getInstance("RSA")
                    .generatePublic(new X509EncodedKeySpec(der));
        } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
            throw new IllegalStateException("Cannot parse JWT_PUBLIC_KEY_PEM", e);
        }
    }

    private static String stripPemHeaders(String pem) {
        return pem.replaceAll("-----[^-]+-----", "").replaceAll("\\s+", "");
    }

    private static KeyPair generateEphemeralKeyPair() {
        try {
            KeyPairGenerator gen = KeyPairGenerator.getInstance("RSA");
            gen.initialize(2048);
            return gen.generateKeyPair();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("RSA not available", e);
        }
    }
}
