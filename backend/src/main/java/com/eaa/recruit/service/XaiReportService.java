package com.eaa.recruit.service;

import com.eaa.recruit.config.XaiProperties;
import com.eaa.recruit.entity.Application;
import com.eaa.recruit.exception.BusinessException;
import com.eaa.recruit.exception.ResourceNotFoundException;
import com.eaa.recruit.repository.ApplicationRepository;
import com.eaa.recruit.security.AuthenticatedUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.net.http.HttpClient;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * FR-35: Download XAI PDF report.
 * Handles both local file paths and HTTP URLs stored in xaiReportUrl.
 */
@Service
public class XaiReportService {

    private static final Logger log = LoggerFactory.getLogger(XaiReportService.class);

    private final ApplicationRepository applicationRepository;
    private final XaiProperties         xaiProperties;
    private final RestClient            downloadClient;

    public XaiReportService(ApplicationRepository applicationRepository,
                             XaiProperties xaiProperties) {
        this.applicationRepository = applicationRepository;
        this.xaiProperties         = xaiProperties;
        var httpClient = HttpClient.newBuilder().version(HttpClient.Version.HTTP_1_1).build();
        var requestFactory = new JdkClientHttpRequestFactory(httpClient);
        this.downloadClient = RestClient.builder().requestFactory(requestFactory).build();
    }

    @Transactional(readOnly = true)
    public Resource getReport(Long applicationId, AuthenticatedUser principal) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        String role = principal.role();
        if ("CANDIDATE".equals(role)) {
            if (!application.getCandidate().getId().equals(principal.id())) {
                throw new BusinessException("You can only access reports for your own applications");
            }
        } else if ("RECRUITER".equals(role)) {
            if (!application.getJob().getCreatedBy().getId().equals(principal.id())) {
                throw new BusinessException("You can only access reports for applications on your jobs");
            }
        }

        String reportUrl = application.getXaiReportUrl();
        if (reportUrl == null || reportUrl.isBlank()) {
            throw new BusinessException("XAI report not available yet");
        }

        return resolveResource(reportUrl);
    }

    private Resource resolveResource(String reportUrl) {
        if (reportUrl.startsWith("http://") || reportUrl.startsWith("https://")) {
            // Proxy download from ai-service using HTTP/1.1
            byte[] pdfBytes = downloadClient.get()
                    .uri(reportUrl)
                    .retrieve()
                    .body(byte[].class);
            if (pdfBytes == null || pdfBytes.length == 0) {
                throw new BusinessException("XAI report download failed");
            }
            log.info("Proxied XAI report from {} ({} bytes)", reportUrl, pdfBytes.length);
            return new ByteArrayResource(pdfBytes);
        }

        // Local file path — resolve relative to configured reports dir
        Path path = Paths.get(xaiProperties.getReportsDir()).resolve(reportUrl).normalize();
        Resource resource = new FileSystemResource(path);
        if (!resource.exists()) {
            throw new ResourceNotFoundException("XAI report file not found");
        }

        log.info("Serving XAI report from {}", path);
        return resource;
    }
}
