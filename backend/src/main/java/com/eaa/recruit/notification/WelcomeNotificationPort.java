package com.eaa.recruit.notification;

/**
 * Port for sending welcome emails to newly created recruiter accounts.
 * Swap implementation per environment (mock in dev, real SMTP in prod).
 */
public interface WelcomeNotificationPort {

    /**
     * @param email             recipient email address
     * @param fullName          recipient full name
     * @param temporaryPassword the plain-text temporary password (before hashing)
     */
    void sendRecruiterWelcome(String email, String fullName, String temporaryPassword);
}
