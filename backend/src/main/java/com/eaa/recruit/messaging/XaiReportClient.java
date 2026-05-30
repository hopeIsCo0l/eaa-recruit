package com.eaa.recruit.messaging;

import com.eaa.recruit.entity.Application;
import com.eaa.recruit.entity.JobPosting;
import com.eaa.recruit.entity.User;
import com.eaa.recruit.repository.ApplicationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.net.http.HttpClient;
import java.util.Map;

/**
 * FR-35 wiring — asks the Python ai-service to build the LIME-backed XAI PDF
 * for a finalised application, then stores the returned downloadUrl on the
 * Application row so candidates can fetch it via Spring's secure download flow.
 *
 * Runs in a separate thread so the recruiter's "record decision" request isn't
 * blocked by the ~5-15 s LIME pass.
 */
@Service
public class XaiReportClient {

    private static final Logger log = LoggerFactory.getLogger(XaiReportClient.class);

    private final RestClient            aiServiceClient;
    private final String                internalApiKey;
    private final ApplicationRepository applicationRepository;

    public XaiReportClient(@Value("${app.events.ai-service-url}") String aiServiceUrl,
                           @Value("${internal.api-key}") String internalApiKey,
                           ApplicationRepository applicationRepository) {
        var httpClient = HttpClient.newBuilder().version(HttpClient.Version.HTTP_1_1).build();
        var requestFactory = new JdkClientHttpRequestFactory(httpClient);
        this.aiServiceClient = RestClient.builder()
                .baseUrl(aiServiceUrl)
                .requestFactory(requestFactory)
                .build();
        this.internalApiKey        = internalApiKey;
        this.applicationRepository = applicationRepository;
    }

    /**
     * Build XAI report asynchronously and store the download URL.
     * Uses readOnly tx to load application data for payload,
     * then native update query to avoid optimistic lock conflicts.
     */
    @Async
    @Transactional
    public void buildAndStore(Long applicationId) {
        Application application = applicationRepository.findById(applicationId).orElse(null);
        if (application == null) {
            log.warn("XAI build skipped — applicationId={} not found", applicationId);
            return;
        }

        try {
            Map<String, Object> body = buildPayload(application);
            @SuppressWarnings("unchecked")
            Map<String, Object> response = aiServiceClient.post()
                    .uri("/api/v1/xai/report")
                    .header("X-Internal-Api-Key", internalApiKey)
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            if (response == null || response.get("downloadUrl") == null) {
                log.error("XAI build returned no downloadUrl applicationId={}", applicationId);
                return;
            }

            String url     = response.get("downloadUrl").toString();
            String summary = response.get("summary") != null ? response.get("summary").toString() : "";
            applicationRepository.updateXaiReportUrlAndSummary(applicationId, url, summary);
            log.info("XAI report stored applicationId={} url={} summaryLen={}", applicationId, url, summary.length());

        } catch (RestClientException ex) {
            log.error("XAI build call failed applicationId={}: {}", applicationId, ex.getMessage(), ex);
        } catch (Exception ex) {
            log.error("XAI build unexpected error applicationId={}: {}", applicationId, ex.getMessage(), ex);
        }
    }

    private Map<String, Object> buildPayload(Application application) {
        User candidate  = application.getCandidate();
        JobPosting job  = application.getJob();
        Double cvUnit   = application.getCvRelevanceScore();   // 0–1
        Double examPct  = application.getExamScore();          // 0–100
        Double finalPct = application.getFinalScore();         // 0–100
        Boolean passed  = application.getHardFilterPassed();

        return Map.of(
                "applicationId",     application.getId(),
                "jobId",             job.getId(),
                "candidateName",     candidate.getFullName(),
                "jobTitle",          job.getTitle(),
                "jobDescription",    job.getDescription(),
                "cvScore",           cvUnit != null  ? cvUnit * 100.0 : 0.0,
                "examScore",         examPct != null ? examPct : 0.0,
                "hardFilterPassed",  Boolean.TRUE.equals(passed),
                "finalScore",        finalPct != null ? finalPct : 0.0,
                "decision",          application.getStatus() != null
                                     ? application.getStatus().name() : "UNKNOWN",
                "recruiterNotes",    application.getDecisionNotes() == null
                                     ? "" : application.getDecisionNotes()
        );
    }
}
