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
public class SmtpCandidateNotificationAdapter implements CandidateNotificationPort {

    private static final Logger log = LoggerFactory.getLogger(SmtpCandidateNotificationAdapter.class);

    private final JavaMailSender mailSender;
    private final String from;

    public SmtpCandidateNotificationAdapter(JavaMailSender mailSender,
                                            @Value("${app.mail.from:${spring.mail.username}}") String from) {
        this.mailSender = mailSender;
        this.from       = from;
    }

    @Override
    public void notifyHardFilterFailed(String email, String fullName, String jobTitle) {
        send(email,
             "Application update — " + jobTitle,
             "Hello " + fullName + ",\n\n"
             + "Thank you for applying to the " + jobTitle + " position at EAA. "
             + "After reviewing your application, we have decided not to proceed at this time.\n\n"
             + "We encourage you to apply for other roles that match your profile.\n\n"
             + "— EAA Recruitment Team");
    }

    @Override
    public void notifyExamAuthorized(String email, String fullName, String jobTitle, String examToken) {
        send(email,
             "Your exam is ready — " + jobTitle,
             "Hello " + fullName + ",\n\n"
             + "Congratulations on passing the initial screening for the " + jobTitle + " position.\n\n"
             + "You are authorized to take the assessment. Use this access token to start:\n\n"
             + "    " + examToken + "\n\n"
             + "Sign in to your candidate dashboard to begin.\n\n"
             + "— EAA Recruitment Team");
    }

    @Override
    public void notifyShortlisted(String email, String fullName, String jobTitle) {
        send(email,
             "You've been shortlisted — " + jobTitle,
             "Hello " + fullName + ",\n\n"
             + "Excellent news — you have been shortlisted for the " + jobTitle + " position.\n\n"
             + "The next step is to book an interview slot. Sign in to your candidate dashboard "
             + "to choose a time that works for you.\n\n"
             + "— EAA Recruitment Team");
    }

    @Override
    public void notifyDecision(String email, String fullName, String jobTitle,
                               String decision, String notes) {
        boolean hired = "HIRED".equalsIgnoreCase(decision) || "ACCEPTED".equalsIgnoreCase(decision);
        String subject = hired
                ? "Offer — " + jobTitle
                : "Application update — " + jobTitle;
        String headline = hired
                ? "We are delighted to offer you the " + jobTitle + " position."
                : "After careful consideration, we have decided not to move forward with your application for the " + jobTitle + " position.";

        StringBuilder body = new StringBuilder()
                .append("Hello ").append(fullName).append(",\n\n")
                .append(headline).append("\n\n");
        if (notes != null && !notes.isBlank()) {
            body.append("Recruiter notes:\n").append(notes).append("\n\n");
        }
        body.append("— EAA Recruitment Team");

        send(email, subject, body.toString());
    }

    @Override
    public void notifyInterviewReminder(String email, String fullName, String jobTitle,
                                        String slotDate, String startTime) {
        send(email,
             "Interview reminder — " + jobTitle,
             "Hello " + fullName + ",\n\n"
             + "This is a reminder of your upcoming interview for the " + jobTitle + " position.\n\n"
             + "    Date: " + slotDate + "\n"
             + "    Time: " + startTime + "\n\n"
             + "Please join on time. Sign in to your dashboard for joining instructions.\n\n"
             + "— EAA Recruitment Team");
    }

    @Override
    public void notifyBookingConfirmed(String email, String fullName, String jobTitle,
                                       String slotDate, String startTime) {
        send(email,
             "Interview booked — " + jobTitle,
             "Hello " + fullName + ",\n\n"
             + "Your interview slot for the " + jobTitle + " position is confirmed.\n\n"
             + "    Date: " + slotDate + "\n"
             + "    Time: " + startTime + "\n\n"
             + "You will receive a reminder the day before. To reschedule, contact us as early as possible.\n\n"
             + "— EAA Recruitment Team");
    }

    @Override
    public void notifyRecruiterInterviewReminder(String email, String recruiterName, String jobTitle,
                                                 String candidateName, String slotDate, String startTime) {
        send(email,
             "Interview reminder — " + candidateName + " for " + jobTitle,
             "Hello " + recruiterName + ",\n\n"
             + "You have an interview scheduled tomorrow.\n\n"
             + "    Candidate: " + candidateName + "\n"
             + "    Role:      " + jobTitle + "\n"
             + "    Date:      " + slotDate + "\n"
             + "    Time:      " + startTime + "\n\n"
             + "— EAA Recruitment Platform");
    }

    private void send(String recipient, String subject, String body) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(from);
            msg.setTo(recipient);
            msg.setSubject(subject);
            msg.setText(body);
            mailSender.send(msg);
            log.info("Notification email sent — to='{}' subject='{}'", recipient, subject);
        } catch (Exception ex) {
            log.error("Notification email failed — to='{}' subject='{}': {}",
                    recipient, subject, ex.getMessage(), ex);
        }
    }
}
