package com.eaa.recruit.notification;

public interface CandidateNotificationPort {

    void notifyHardFilterFailed(String email, String fullName, String jobTitle);

    void notifyExamAuthorized(String email, String fullName, String jobTitle, String examToken);
}
