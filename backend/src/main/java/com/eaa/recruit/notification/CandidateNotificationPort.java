package com.eaa.recruit.notification;

public interface CandidateNotificationPort {

    void notifyHardFilterFailed(String email, String fullName, String jobTitle);

    void notifyExamAuthorized(String email, String fullName, String jobTitle, String examToken);

    void notifyShortlisted(String email, String fullName, String jobTitle);

    void notifyDecision(String email, String fullName, String jobTitle, String decision, String notes);

    void notifyInterviewReminder(String email, String fullName, String jobTitle,
                                  String slotDate, String startTime);
}
