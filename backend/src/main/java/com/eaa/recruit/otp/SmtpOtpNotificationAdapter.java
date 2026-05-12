package com.eaa.recruit.otp;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.mail.enabled", havingValue = "true")
public class SmtpOtpNotificationAdapter implements OtpNotificationPort {

    private static final Logger log = LoggerFactory.getLogger(SmtpOtpNotificationAdapter.class);

    private final JavaMailSender mailSender;
    private final String from;

    public SmtpOtpNotificationAdapter(JavaMailSender mailSender,
                                      @Value("${app.mail.from:${spring.mail.username}}") String from) {
        this.mailSender = mailSender;
        this.from       = from;
    }

    @Override
    public void send(String recipient, String otp) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(from);
        msg.setTo(recipient);
        msg.setSubject("Your EAA verification code");
        msg.setText("Your verification code is: " + otp + "\n\nIt expires in a few minutes.");
        mailSender.send(msg);
        log.info("OTP email dispatched to '{}'", recipient);
    }
}
