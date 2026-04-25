package com.eaa.recruit.otp;

/**
 * Result of an OTP verification attempt.
 * Sealed to force exhaustive handling at call sites.
 */
public sealed interface OtpVerificationResult
        permits OtpVerificationResult.Success,
                OtpVerificationResult.Expired,
                OtpVerificationResult.Invalid,
                OtpVerificationResult.Blocked,
                OtpVerificationResult.ServiceUnavailable {

    record Success()            implements OtpVerificationResult {}
    record Expired()            implements OtpVerificationResult {}
    record Invalid()            implements OtpVerificationResult {}
    record Blocked()            implements OtpVerificationResult {}
    record ServiceUnavailable() implements OtpVerificationResult {}

    default boolean isSuccess() { return this instanceof Success; }

    default String message() {
        return switch (this) {
            case Success ignored            -> "OTP verified successfully";
            case Expired ignored            -> "OTP has expired. Please request a new one";
            case Invalid ignored            -> "OTP is incorrect";
            case Blocked ignored            -> "Too many failed attempts. Please wait 15 minutes before trying again";
            case ServiceUnavailable ignored -> "Verification service temporarily unavailable";
        };
    }
}
