package com.eaa.recruit.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class MockCandidateNotificationAdapter implements CandidateNotificationPort {

    private static final Logger log = LoggerFactory.getLogger(MockCandidateNotificationAdapter.class);

    @Override
    public void notifyHardFilterFailed(String email, String fullName, String jobTitle) {
        log.info("[MOCK NOTIFY] Hard filter failed — to='{}' name='{}' job='{}'",
                email, fullName, jobTitle);
    }

    @Override
    public void notifyExamAuthorized(String email, String fullName, String jobTitle, String examToken) {
        log.info("[MOCK NOTIFY] Exam authorized — to='{}' name='{}' job='{}' token='{}'",
                email, fullName, jobTitle, examToken);
    }
}
