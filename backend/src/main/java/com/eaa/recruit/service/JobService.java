package com.eaa.recruit.service;

import com.eaa.recruit.dto.job.ChangeJobStatusRequest;
import com.eaa.recruit.dto.job.CreateJobRequest;
import com.eaa.recruit.dto.job.CreateJobResponse;
import com.eaa.recruit.dto.job.JobResponse;
import com.eaa.recruit.dto.job.UpdateJobRequest;
import com.eaa.recruit.entity.JobPosting;
import com.eaa.recruit.entity.JobPostingStatus;
import com.eaa.recruit.entity.User;
import com.eaa.recruit.exception.BusinessException;
import com.eaa.recruit.exception.ResourceNotFoundException;
import com.eaa.recruit.messaging.JobRelevanceClient;
import com.eaa.recruit.messaging.JobRelevanceClient.RelevanceResult;
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

    // Minimum LLM confidence to actually block a job. The local qwen2.5:1.5b
    // model is hedged and rarely reports >0.5 even on clear-cut cases, so we
    // gate at 0.5 inclusive. Tunable up if the model is upgraded to a larger one.
    private static final double RELEVANCE_BLOCK_CONFIDENCE = 0.5;

    private final JobPostingRepository jobPostingRepository;
    private final UserRepository       userRepository;
    private final JobRelevanceClient   jobRelevanceClient;

    public JobService(JobPostingRepository jobPostingRepository,
                      UserRepository userRepository,
                      JobRelevanceClient jobRelevanceClient) {
        this.jobPostingRepository = jobPostingRepository;
        this.userRepository       = userRepository;
        this.jobRelevanceClient   = jobRelevanceClient;
    }

    @Transactional
    public CreateJobResponse createJob(CreateJobRequest request, AuthenticatedUser principal) {
        validateDateOrdering(request);

        // FR-NEW: aviation-domain gate. Ollama checks if the job description
        // is in EAA's domain (airlines, aviation academy, MRO, ATC, etc.).
        // If the LLM is confident the description is off-domain, reject creation
        // with the LLM's reason so the recruiter sees why.
        RelevanceResult verdict = jobRelevanceClient.check(
                request.title(), request.description(), request.requiredDegree());

        if (!verdict.relevant()
                && verdict.isOllamaBacked()
                && verdict.confidence() >= RELEVANCE_BLOCK_CONFIDENCE) {
            log.warn("Job creation blocked — non-aviation description. recruiterId={} title='{}' reason='{}'",
                    principal.id(), request.title(), verdict.reason());
            throw new BusinessException(
                    "Job description appears non-aviation (" + verdict.category() + "). "
                            + verdict.reason()
                            + " Adjust the description so it clearly relates to Ethiopian Airlines "
                            + "or the Ethiopian Aviation Academy domain, then try again.");
        }

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
        // Candidates should see both OPEN and EXAM_SCHEDULED jobs — the latter
        // is still applyable until the close date; the only difference is that
        // an exam window has been pinned. CLOSED / ARCHIVED / DRAFT are hidden.
        return jobPostingRepository.findByStatusIn(
                List.of(JobPostingStatus.OPEN, JobPostingStatus.EXAM_SCHEDULED))
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

    @Transactional
    public JobResponse updateJob(Long id, UpdateJobRequest request, AuthenticatedUser principal) {
        JobPosting job = jobPostingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + id));

        if (!job.getCreatedBy().getId().equals(principal.id())) {
            throw new BusinessException("You can only edit your own job postings");
        }
        if (job.getStatus() == JobPostingStatus.ARCHIVED) {
            throw new BusinessException("Archived jobs cannot be edited");
        }

        job.update(
                request.title(), request.description(),
                request.minHeightCm(), request.minWeightKg(),
                request.requiredDegree(),
                request.openDate(), request.closeDate(), request.examDate()
        );
        job = jobPostingRepository.save(job);
        log.info("Job posting updated id={} by recruiterId={}", id, principal.id());
        return toResponse(job);
    }

    @Transactional
    public JobResponse changeJobStatus(Long id, ChangeJobStatusRequest request, AuthenticatedUser principal) {
        JobPosting job = jobPostingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + id));

        if (!job.getCreatedBy().getId().equals(principal.id())) {
            throw new BusinessException("You can only manage your own job postings");
        }

        switch (request.action().toLowerCase()) {
            case "publish" -> {
                if (job.getStatus() != JobPostingStatus.DRAFT) {
                    throw new BusinessException("Only DRAFT jobs can be published");
                }
                job.publish();
            }
            case "close" -> {
                if (job.getStatus() != JobPostingStatus.OPEN && job.getStatus() != JobPostingStatus.EXAM_SCHEDULED) {
                    throw new BusinessException("Only OPEN or EXAM_SCHEDULED jobs can be closed");
                }
                job.close();
            }
            case "archive" -> {
                if (job.getStatus() == JobPostingStatus.ARCHIVED) {
                    throw new BusinessException("Job is already archived");
                }
                job.archive();
            }
            default -> throw new BusinessException("Unknown action: " + request.action()
                    + ". Use: publish, close, archive");
        }

        job = jobPostingRepository.save(job);
        log.info("Job status changed id={} to {} by recruiterId={}", id, job.getStatus(), principal.id());
        return toResponse(job);
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
