package com.eaa.recruit.notification;

public interface WelcomeNotificationPort {
    void sendRecruiterWelcome(String email, String fullName, String temporaryPassword);
}
