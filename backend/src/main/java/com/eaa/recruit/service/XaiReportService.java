package com.eaa.recruit.service;

import com.eaa.recruit.config.XaiProperties;
import com.eaa.recruit.entity.Application;
import com.eaa.recruit.exception.BusinessException;
import com.eaa.recruit.exception.ResourceNotFoundException;
import com.eaa.recruit.repository.ApplicationRepository;
import com.eaa.recruit.security.AuthenticatedUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.MalformedURLException;
import java.net.URL;
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

    public XaiReportService(ApplicationRepository applicationRepository,
                             XaiProperties xaiProperties) {
        this.applicationRepository = applicationRepository;
        this.xaiProperties         = xaiProperties;
    }

    @Transactional(readOnly = true)
    public Resource getReport(Long applicationId, AuthenticatedUser principal) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        if (!application.getCandidate().getId().equals(principal.id())) {
            throw new BusinessException("You can only access reports for your own applications");
        }

        String reportUrl = application.getXaiReportUrl();
        if (reportUrl == null || reportUrl.isBlank()) {
            throw new BusinessException("XAI report not available yet");
        }

        return resolveResource(reportUrl);
    }

    private Resource resolveResource(String reportUrl) {
        if (reportUrl.startsWith("http://") || reportUrl.startsWith("https://")) {
            try {
                return new UrlResource(new URL(reportUrl));
            } catch (MalformedURLException e) {
                throw new BusinessException("Invalid XAI report URL");
            }
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
