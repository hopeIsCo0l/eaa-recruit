package com.eaa.recruit.otp;

/**
 * Port for dispatching OTP codes to users.
 * Swap implementations per environment (mock in dev, real email/SMS in prod).
 */
public interface OtpNotificationPort {

    /**
     * @param recipient email address or phone number
     * @param otp       the 6-digit code to deliver
     */
    void send(String recipient, String otp);
}
