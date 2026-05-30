package com.eaa.recruit.messaging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.Map;

/**
 * Calls the AI service's job-relevance endpoint to check whether a recruiter's
 * job description belongs to the aviation domain. Used as a gate at job
 * creation time (see {@code JobService.createJob}).
 *
 * Falls open (returns {@link RelevanceResult#unknown()}) if the AI service is
 * unreachable so a single-point failure can't block recruiters indefinitely —
 * admins still see a warning in logs and can re-run analysis manually.
 */
@Service
public class JobRelevanceClient {

    private static final Logger log = LoggerFactory.getLogger(JobRelevanceClient.class);

    private final RestClient aiServiceClient;
    private final String     internalApiKey;

    public JobRelevanceClient(@Value("${app.events.ai-service-url}") String aiServiceUrl,
                              @Value("${internal.api-key}") String internalApiKey) {
        var httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .connectTimeout(Duration.ofSeconds(5))
                .build();
        var requestFactory = new JdkClientHttpRequestFactory(httpClient);
        this.aiServiceClient = RestClient.builder()
                .baseUrl(aiServiceUrl)
                .requestFactory(requestFactory)
                .build();
        this.internalApiKey = internalApiKey;
    }

    public record RelevanceResult(boolean relevant,
                                  double confidence,
                                  String reason,
                                  String category,
                                  String source) {

        public static RelevanceResult unknown() {
            return new RelevanceResult(true, 0.0,
                    "AI relevance check unavailable", "unknown", "fallback");
        }

        public boolean isOllamaBacked() {
            return "ollama".equals(source);
        }
    }

    /**
     * Returns the LLM's verdict on whether the job is aviation-relevant.
     * Never throws — returns a fallback (relevant=true) on any error so the
     * recruiter is not blocked by an AI outage.
     */
    @SuppressWarnings("unchecked")
    public RelevanceResult check(String title, String description, String requiredDegree) {
        try {
            Map<String, Object> body = Map.of(
                    "title",          title == null ? "" : title,
                    "description",    description == null ? "" : description,
                    "requiredDegree", requiredDegree == null ? "" : requiredDegree
            );
            Map<String, Object> response = aiServiceClient.post()
                    .uri("/job-relevance/check")
                    .header("X-Internal-Api-Key", internalApiKey)
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            if (response == null) {
                log.warn("Job relevance check returned null body");
                return RelevanceResult.unknown();
            }

            boolean relevant = Boolean.TRUE.equals(response.get("relevant"));
            double confidence = response.get("confidence") instanceof Number n ? n.doubleValue() : 0.0;
            String reason     = String.valueOf(response.getOrDefault("reason", ""));
            String category   = String.valueOf(response.getOrDefault("category", "unknown"));
            String source     = String.valueOf(response.getOrDefault("source", "ollama"));

            log.info("Job relevance check: relevant={} confidence={} category={} source={}",
                    relevant, confidence, category, source);

            return new RelevanceResult(relevant, confidence, reason, category, source);

        } catch (RestClientException ex) {
            log.warn("Job relevance check call failed (falling open): {}", ex.getMessage());
            return RelevanceResult.unknown();
        } catch (Exception ex) {
            log.warn("Job relevance check unexpected error (falling open): {}", ex.getMessage());
            return RelevanceResult.unknown();
        }
    }
}
