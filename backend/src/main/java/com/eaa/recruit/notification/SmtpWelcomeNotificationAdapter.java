package com.eaa.recruit.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.mail.enabled", havingValue = "true")
public class SmtpWelcomeNotificationAdapter implements WelcomeNotificationPort {

    private static final Logger log = LoggerFactory.getLogger(SmtpWelcomeNotificationAdapter.class);

    private final JavaMailSender mailSender;
    private final String from;

    public SmtpWelcomeNotificationAdapter(JavaMailSender mailSender,
                                          @Value("${app.mail.from:${spring.mail.username}}") String from) {
        this.mailSender = mailSender;
        this.from       = from;
    }

    @Override
    public void sendRecruiterWelcome(String email, String fullName, String temporaryPassword) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(from);
            msg.setTo(email);
            msg.setSubject("Welcome to EAA Recruit");
            msg.setText("Hello " + fullName + ",\n\n"
                    + "A recruiter account has been created for you on EAA Recruit.\n\n"
                    + "    Email:    " + email + "\n"
                    + "    Password: " + temporaryPassword + "\n\n"
                    + "Please sign in and change your password immediately.\n\n"
                    + "— EAA Recruitment Team");
            mailSender.send(msg);
            log.info("Welcome email sent — to='{}'", email);
        } catch (Exception ex) {
            log.error("Welcome email failed — to='{}': {}", email, ex.getMessage(), ex);
        }
    }
}
