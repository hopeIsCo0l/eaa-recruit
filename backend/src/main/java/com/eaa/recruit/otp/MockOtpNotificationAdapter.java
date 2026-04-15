package com.eaa.recruit.otp;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Mock OTP notification adapter for development and test environments.
 *
 * Logs the OTP to the console instead of sending a real email or SMS.
 * Active on all profiles except "prod". In production, replace with a
 * real SMTP / Twilio adapter and annotate with @Profile("prod").
 */
@Component
@Profile("!prod")
public class MockOtpNotificationAdapter implements OtpNotificationPort {

    private static final Logger log = LoggerFactory.getLogger(MockOtpNotificationAdapter.class);

    @Override
    public void send(String recipient, String otp) {
        log.info("╔══════════════════════════════════════╗");
        log.info("║  [MOCK OTP]  Recipient : {}",  recipient);
        log.info("║  [MOCK OTP]  Code      : {}",  otp);
        log.info("╚══════════════════════════════════════╝");
    }
}
