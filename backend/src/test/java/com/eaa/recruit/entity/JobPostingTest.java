package com.eaa.recruit.entity;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class JobPostingTest {

    private static final LocalDate OPEN  = LocalDate.now().plusDays(1);
    private static final LocalDate CLOSE = OPEN.plusDays(30);
    private static final LocalDate EXAM  = CLOSE.plusDays(7);

    private User recruiter() {
        return User.create("recruiter@eaa.com", "hash", Role.RECRUITER, "Alice");
    }

    private JobPosting posting() {
        return JobPosting.create("Pilot", "Fly planes", 170, 60, "BSc Aviation",
                OPEN, CLOSE, EXAM, recruiter());
    }

    @Test void newPosting_statusIsDraft() {
        assertThat(posting().getStatus()).isEqualTo(JobPostingStatus.DRAFT);
    }

    @Test void publish_setsStatusOpen() {
        JobPosting jp = posting();
        jp.publish();
        assertThat(jp.getStatus()).isEqualTo(JobPostingStatus.OPEN);
    }

    @Test void close_setsStatusClosed() {
        JobPosting jp = posting();
        jp.publish();
        jp.close();
        assertThat(jp.getStatus()).isEqualTo(JobPostingStatus.CLOSED);
    }

    @Test void scheduleExam_setsStatusExamScheduled() {
        JobPosting jp = posting();
        jp.publish();
        jp.scheduleExam();
        assertThat(jp.getStatus()).isEqualTo(JobPostingStatus.EXAM_SCHEDULED);
    }

    @Test void fieldsPreserved() {
        JobPosting jp = posting();
        assertThat(jp.getTitle()).isEqualTo("Pilot");
        assertThat(jp.getDescription()).isEqualTo("Fly planes");
        assertThat(jp.getMinHeightCm()).isEqualTo(170);
        assertThat(jp.getMinWeightKg()).isEqualTo(60);
        assertThat(jp.getRequiredDegree()).isEqualTo("BSc Aviation");
        assertThat(jp.getOpenDate()).isEqualTo(OPEN);
        assertThat(jp.getCloseDate()).isEqualTo(CLOSE);
        assertThat(jp.getExamDate()).isEqualTo(EXAM);
        assertThat(jp.getCreatedBy().getRole()).isEqualTo(Role.RECRUITER);
    }
}
