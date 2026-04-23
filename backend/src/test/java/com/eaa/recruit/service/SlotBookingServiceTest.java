package com.eaa.recruit.service;

import com.eaa.recruit.dto.availability.AvailabilitySlotResponse;
import com.eaa.recruit.entity.*;
import com.eaa.recruit.exception.BusinessException;
import com.eaa.recruit.exception.ConflictException;
import com.eaa.recruit.exception.ResourceNotFoundException;
import com.eaa.recruit.notification.CandidateNotificationPort;
import com.eaa.recruit.repository.ApplicationRepository;
import com.eaa.recruit.repository.AvailabilitySlotRepository;
import com.eaa.recruit.security.AuthenticatedUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SlotBookingServiceTest {

    @Mock ApplicationRepository       applicationRepository;
    @Mock AvailabilitySlotRepository  slotRepository;
    @Mock CandidateNotificationPort   candidateNotificationPort;

    SlotBookingService service;

    private static final AuthenticatedUser CANDIDATE =
            new AuthenticatedUser(10L, "candidate@eaa.com", "CANDIDATE");

    @BeforeEach
    void setUp() {
        service = new SlotBookingService(applicationRepository, slotRepository, candidateNotificationPort);
    }

    private User recruiter(Long id) {
        User r = User.create("r@eaa.com", "hash", Role.RECRUITER, "Alice");
        setId(r, id);
        return r;
    }

    private User candidate() {
        User c = User.create("candidate@eaa.com", "hash", Role.CANDIDATE, "Bob");
        setId(c, 10L);
        return c;
    }

    private JobPosting job(User rec) {
        JobPosting j = JobPosting.create("Pilot", "desc", 170, 60, "BSc",
                LocalDate.now().plusDays(1), LocalDate.now().plusDays(30),
                LocalDate.now().plusDays(37), rec);
        setId(j, 1L);
        return j;
    }

    private Application shortlisted(User cand, JobPosting j) {
        Application app = Application.create(cand, j, "cv.pdf");
        app.applyAiScore(0.9, "url");
        app.markHardFilterPassed();
        app.authorizeExam("tok");
        app.recordExamScore(80.0, 85.0, java.time.Instant.now());
        app.shortlist();
        setId(app, 5L);
        return app;
    }

    private AvailabilitySlot slot(User rec, Long id, boolean booked) {
        AvailabilitySlot s = AvailabilitySlot.create(rec, LocalDate.now().plusDays(5),
                LocalTime.of(10, 0), LocalTime.of(11, 0));
        setId(s, id);
        if (booked) s.book(candidate());
        return s;
    }

    private static void setId(Object entity, Long id) {
        try {
            var f = BaseEntity.class.getDeclaredField("id");
            f.setAccessible(true);
            f.set(entity, id);
        } catch (ReflectiveOperationException e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void listAvailableForJob_returnsUnbookedSlotsForJobsRecruiter() {
        User rec = recruiter(7L);
        JobPosting j = job(rec);
        Application app = shortlisted(candidate(), j);

        when(applicationRepository.findByCandidateIdAndJobId(10L, 1L)).thenReturn(Optional.of(app));
        when(slotRepository.findAvailableByRecruiterId(eq(7L), any(LocalDate.class)))
                .thenReturn(List.of(slot(rec, 100L, false), slot(rec, 101L, false)));

        List<AvailabilitySlotResponse> slots = service.listAvailableForJob(1L, CANDIDATE);

        assertThat(slots).hasSize(2);
        assertThat(slots).allMatch(s -> !s.booked());
    }

    @Test
    void listAvailableForJob_throwsNotFound_whenNoApplicationForJob() {
        when(applicationRepository.findByCandidateIdAndJobId(10L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.listAvailableForJob(1L, CANDIDATE))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void bookSlot_success_updatesStatusAndNotifies() {
        User rec = recruiter(7L);
        JobPosting j = job(rec);
        Application app = shortlisted(candidate(), j);
        AvailabilitySlot s = slot(rec, 100L, false);

        when(applicationRepository.findByCandidateIdAndJobId(10L, 1L)).thenReturn(Optional.of(app));
        when(slotRepository.findById(100L)).thenReturn(Optional.of(s));
        when(slotRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(applicationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.bookSlot(1L, 100L, CANDIDATE);

        assertThat(app.getStatus()).isEqualTo(ApplicationStatus.INTERVIEW_SCHEDULED);
        assertThat(s.isBooked()).isTrue();
        verify(candidateNotificationPort).notifyBookingConfirmed(
                eq("candidate@eaa.com"), eq("Bob"), eq("Pilot"), anyString(), anyString());
    }

    @Test
    void bookSlot_throwsConflict_whenAlreadyInterviewScheduled() {
        User rec = recruiter(7L);
        JobPosting j = job(rec);
        Application app = shortlisted(candidate(), j);
        app.bookInterviewSlot(slot(rec, 999L, false)); // status → INTERVIEW_SCHEDULED

        when(applicationRepository.findByCandidateIdAndJobId(10L, 1L)).thenReturn(Optional.of(app));

        assertThatThrownBy(() -> service.bookSlot(1L, 100L, CANDIDATE))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("already booked");

        verify(slotRepository, never()).findById(anyLong());
    }

    @Test
    void bookSlot_throwsBusinessException_whenNotShortlisted() {
        User rec = recruiter(7L);
        JobPosting j = job(rec);
        User cand = candidate();
        Application app = Application.create(cand, j, "cv.pdf"); // status=SUBMITTED
        setId(app, 5L);

        when(applicationRepository.findByCandidateIdAndJobId(10L, 1L)).thenReturn(Optional.of(app));

        assertThatThrownBy(() -> service.bookSlot(1L, 100L, CANDIDATE))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void bookSlot_throwsConflict_whenSlotAlreadyBooked() {
        User rec = recruiter(7L);
        JobPosting j = job(rec);
        Application app = shortlisted(candidate(), j);
        AvailabilitySlot s = slot(rec, 100L, true); // already booked

        when(applicationRepository.findByCandidateIdAndJobId(10L, 1L)).thenReturn(Optional.of(app));
        when(slotRepository.findById(100L)).thenReturn(Optional.of(s));

        assertThatThrownBy(() -> service.bookSlot(1L, 100L, CANDIDATE))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void bookSlot_throwsBusinessException_whenSlotBelongsToDifferentRecruiter() {
        User jobRec   = recruiter(7L);
        User otherRec = recruiter(99L);
        JobPosting j  = job(jobRec);
        Application app = shortlisted(candidate(), j);
        AvailabilitySlot s = slot(otherRec, 100L, false);

        when(applicationRepository.findByCandidateIdAndJobId(10L, 1L)).thenReturn(Optional.of(app));
        when(slotRepository.findById(100L)).thenReturn(Optional.of(s));

        assertThatThrownBy(() -> service.bookSlot(1L, 100L, CANDIDATE))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("does not belong");
    }
}
