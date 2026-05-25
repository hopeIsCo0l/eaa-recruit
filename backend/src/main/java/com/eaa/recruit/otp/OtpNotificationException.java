package com.eaa.recruit.otp;

/**
 * Thrown when an OTP cannot be delivered (SMTP failure, transport down, etc.).
 * Callers should treat this as a transient infrastructure failure (HTTP 503)
 * and roll back any cached OTP so the user can retry.
 */
public class OtpNotificationException extends RuntimeException {
    public OtpNotificationException(String message, Throwable cause) {
        super(message, cause);
    }
}
