package com.eaa.recruit.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("!prod")
public class MockWelcomeNotificationAdapter implements WelcomeNotificationPort {

    private static final Logger log = LoggerFactory.getLogger(MockWelcomeNotificationAdapter.class);

    @Override
    public void sendRecruiterWelcome(String email, String fullName, String temporaryPassword) {
        log.info("╔══════════════════════════════════════════╗");
        log.info("║  [MOCK WELCOME]  To       : {}", email);
        log.info("║  [MOCK WELCOME]  Name     : {}", fullName);
        log.info("║  [MOCK WELCOME]  Password : {}", temporaryPassword);
        log.info("╚══════════════════════════════════════════╝");
    }
}
