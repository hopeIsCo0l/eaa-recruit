package com.eaa.recruit.service;

import com.eaa.recruit.dto.recruiter.DashboardEntryResponse;
import com.eaa.recruit.dto.recruiter.RecruiterApplicationResponse;
import com.eaa.recruit.repository.ApplicationRepository;
import com.eaa.recruit.repository.projection.DashboardProjection;
import com.eaa.recruit.security.AuthenticatedUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class RecruiterDashboardService {

    private final ApplicationRepository applicationRepository;

    public RecruiterDashboardService(ApplicationRepository applicationRepository) {
        this.applicationRepository = applicationRepository;
    }

    /** FR-17: Paginated dashboard showing application counts per job for the recruiter. */
    @Transactional(readOnly = true)
    public Page<DashboardEntryResponse> getDashboard(AuthenticatedUser principal, Pageable pageable) {
        Page<DashboardProjection> projections =
                applicationRepository.findDashboardByRecruiterId(principal.id(), pageable);

        List<DashboardEntryResponse> entries = projections.getContent().stream()
                .map(p -> new DashboardEntryResponse(
                        p.getJobId(),
                        p.getJobTitle(),
                        p.getTotalApplications(),
                        p.getScreeningCount(),
                        p.getExamCount(),
                        p.getInterviewCount(),
                        p.getDecidedCount()
                ))
                .toList();

        return new PageImpl<>(entries, pageable, projections.getTotalElements());
    }

    /** List all applications across the recruiter's jobs. */
    @Transactional(readOnly = true)
    public List<RecruiterApplicationResponse> listApplications(AuthenticatedUser principal) {
        return applicationRepository.findAllByRecruiterId(principal.id())
                .stream()
                .map(row -> new RecruiterApplicationResponse(
                        ((Number) row[0]).longValue(),                          // id
                        ((Number) row[1]).longValue(),                          // jobId
                        (String) row[2],                                        // jobTitle
                        (String) row[3],                                        // candidateName
                        (String) row[4],                                        // candidateEmail
                        (String) row[5],                                        // status
                        row[6] == null ? null : ((Number) row[6]).doubleValue(), // cvRelevanceScore
                        row[7] == null ? null : ((Number) row[7]).doubleValue(), // examScore
                        row[8] == null ? null : ((Number) row[8]).doubleValue(), // finalScore
                        row[9] == null ? null : (Boolean) row[9],               // hardFilterPassed
                        row[10] == null ? null : (row[10] instanceof Instant inst ? inst : ((java.sql.Timestamp) row[10]).toInstant()), // submittedAt
                        row[11] == null ? null : (row[11] instanceof LocalDate ld ? ld : ((java.sql.Date) row[11]).toLocalDate()), // interviewDate
                        row[12] == null ? null : (row[12] instanceof LocalTime lt ? lt : ((java.sql.Time) row[12]).toLocalTime())  // interviewTime
                ))
                .toList();
    }
}
