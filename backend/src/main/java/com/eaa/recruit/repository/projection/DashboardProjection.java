package com.eaa.recruit.repository.projection;

/** Spring Data native-query projection for recruiter dashboard aggregation. */
public interface DashboardProjection {
    Long   getJobId();
    String getJobTitle();
    Long   getTotalApplications();
    Long   getScreeningCount();
    Long   getExamCount();
    Long   getInterviewCount();
    Long   getDecidedCount();
}
