package com.eaa.recruit.service;

import com.eaa.recruit.dto.application.AlignmentPair;
import com.eaa.recruit.dto.application.ExplanationResponse;
import com.eaa.recruit.entity.Application;
import com.eaa.recruit.exception.BusinessException;
import com.eaa.recruit.exception.ResourceNotFoundException;
import com.eaa.recruit.repository.ApplicationRepository;
import com.eaa.recruit.security.AuthenticatedUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.net.http.HttpClient;
import java.util.List;
import java.util.Map;

/**
 * FR-35: Proxies semantic explanation data from the AI service for a given application.
 */
@Service
public class ExplanationService {

    private static final Logger log = LoggerFactory.getLogger(ExplanationService.class);

    private final ApplicationRepository applicationRepository;
    private final RestClient            aiServiceClient;
    private final String                internalApiKey;

    public ExplanationService(ApplicationRepository applicationRepository,
                               @Value("${app.events.ai-service-url}") String aiServiceUrl,
                               @Value("${internal.api-key}") String internalApiKey) {
        this.applicationRepository = applicationRepository;
        this.internalApiKey        = internalApiKey;
        var httpClient     = HttpClient.newBuilder().version(HttpClient.Version.HTTP_1_1).build();
        var requestFactory = new JdkClientHttpRequestFactory(httpClient);
        this.aiServiceClient = RestClient.builder()
                .baseUrl(aiServiceUrl)
                .requestFactory(requestFactory)
                .build();
    }

    @Transactional(readOnly = true)
    public ExplanationResponse getExplanation(Long applicationId, AuthenticatedUser principal) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        String role = principal.role();
        if ("CANDIDATE".equals(role) && !application.getCandidate().getId().equals(principal.id())) {
            throw new BusinessException("You can only view explanations for your own applications");
        }
        if ("RECRUITER".equals(role) && !application.getJob().getCreatedBy().getId().equals(principal.id())) {
            throw new BusinessException("You can only view explanations for applications on your jobs");
        }

        if (!application.hasFinalDecision()) {
            throw new ResourceNotFoundException("Explanation not available — no final decision recorded yet");
        }

        Long jobId = application.getJob().getId();

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> raw = aiServiceClient.get()
                    .uri("/api/v1/xai/explanation/{appId}/{jobId}", applicationId, jobId)
                    .header("X-Internal-Api-Key", internalApiKey)
                    .retrieve()
                    .body(Map.class);

            if (raw == null) {
                return unavailable(applicationId, jobId);
            }

            boolean available = Boolean.TRUE.equals(raw.get("available"));
            List<AlignmentPair> strong = parsePairs(raw, "strongMatches");
            List<AlignmentPair> weak   = parsePairs(raw, "weakMatches");

            @SuppressWarnings("unchecked")
            List<String> gaps = raw.get("gaps") instanceof List<?> g
                    ? (List<String>) g
                    : List.of();

            return new ExplanationResponse(applicationId, jobId, available, strong, weak, gaps);

        } catch (RestClientException ex) {
            log.warn("AI service explanation call failed applicationId={}: {}", applicationId, ex.getMessage());
            return unavailable(applicationId, jobId);
        }
    }

    @SuppressWarnings("unchecked")
    private List<AlignmentPair> parsePairs(Map<String, Object> raw, String key) {
        if (!(raw.get(key) instanceof List<?> list)) return List.of();
        return list.stream()
                .filter(item -> item instanceof Map)
                .map(item -> {
                    Map<String, Object> m = (Map<String, Object>) item;
                    return new AlignmentPair(
                            String.valueOf(m.getOrDefault("cv_chunk", "")),
                            String.valueOf(m.getOrDefault("jd_chunk", "")),
                            ((Number) m.getOrDefault("similarity", 0.0)).doubleValue()
                    );
                })
                .toList();
    }

    private ExplanationResponse unavailable(Long applicationId, Long jobId) {
        return new ExplanationResponse(applicationId, jobId, false, List.of(), List.of(), List.of());
    }
}
