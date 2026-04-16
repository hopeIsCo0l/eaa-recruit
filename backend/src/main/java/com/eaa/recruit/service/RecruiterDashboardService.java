package com.eaa.recruit.service;

import com.eaa.recruit.dto.recruiter.DashboardEntryResponse;
import com.eaa.recruit.repository.ApplicationRepository;
import com.eaa.recruit.repository.projection.DashboardProjection;
import com.eaa.recruit.security.AuthenticatedUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
}
