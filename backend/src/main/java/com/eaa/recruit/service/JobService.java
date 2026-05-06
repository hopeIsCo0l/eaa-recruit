package com.eaa.recruit.service;

import com.eaa.recruit.dto.job.CreateJobRequest;
import com.eaa.recruit.dto.job.CreateJobResponse;
import com.eaa.recruit.dto.job.JobResponse;
import com.eaa.recruit.entity.JobPosting;
import com.eaa.recruit.entity.JobPostingStatus;
import com.eaa.recruit.entity.User;
import com.eaa.recruit.exception.BusinessException;
import com.eaa.recruit.exception.ResourceNotFoundException;
import com.eaa.recruit.repository.JobPostingRepository;
import com.eaa.recruit.repository.UserRepository;
import com.eaa.recruit.security.AuthenticatedUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class JobService {

    private static final Logger log = LoggerFactory.getLogger(JobService.class);

    private final JobPostingRepository jobPostingRepository;
    private final UserRepository       userRepository;

    public JobService(JobPostingRepository jobPostingRepository,
                      UserRepository userRepository) {
        this.jobPostingRepository = jobPostingRepository;
        this.userRepository       = userRepository;
    }

    @Transactional
    public CreateJobResponse createJob(CreateJobRequest request, AuthenticatedUser principal) {
        validateDateOrdering(request);

        User recruiter = userRepository.findById(principal.id())
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter not found"));

        JobPosting job = JobPosting.create(
                request.title(),
                request.description(),
                request.minHeightCm(),
                request.minWeightKg(),
                request.requiredDegree(),
                request.openDate(),
                request.closeDate(),
                request.examDate(),
                recruiter
        );

        job = jobPostingRepository.save(job);
        log.info("Job posting created id={} title='{}' by recruiterId={}", job.getId(), job.getTitle(), principal.id());

        return new CreateJobResponse(
                job.getId(),
                job.getTitle(),
                job.getStatus(),
                job.getOpenDate(),
                job.getCloseDate(),
                job.getExamDate()
        );
    }

    @Transactional(readOnly = true)
    public List<JobResponse> listOpenJobs() {
        return jobPostingRepository.findByStatus(JobPostingStatus.OPEN)
                .stream().map(JobService::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<JobResponse> listJobsByRecruiter(Long recruiterId) {
        return jobPostingRepository.findByCreatedById(recruiterId)
                .stream().map(JobService::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public JobResponse getJob(Long id) {
        JobPosting job = jobPostingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + id));
        return toResponse(job);
    }

    private static JobResponse toResponse(JobPosting job) {
        return new JobResponse(
                job.getId(),
                job.getTitle(),
                job.getDescription(),
                job.getMinHeightCm(),
                job.getMinWeightKg(),
                job.getRequiredDegree(),
                job.getOpenDate(),
                job.getCloseDate(),
                job.getExamDate(),
                job.getStatus()
        );
    }

    private void validateDateOrdering(CreateJobRequest request) {
        if (!request.closeDate().isAfter(request.openDate())) {
            throw new BusinessException("closeDate must be after openDate");
        }
        if (!request.examDate().isAfter(request.closeDate())) {
            throw new BusinessException("examDate must be after closeDate");
        }
    }
}
