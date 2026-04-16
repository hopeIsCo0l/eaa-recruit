package com.eaa.recruit.service;

import com.eaa.recruit.dto.analytics.AnalyticsExportResponse;
import com.eaa.recruit.repository.ApplicationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * FR-40: Analytics export for super admin.
 */
@Service
public class AnalyticsService {

    private final ApplicationRepository applicationRepository;

    public AnalyticsService(ApplicationRepository applicationRepository) {
        this.applicationRepository = applicationRepository;
    }

    @Transactional(readOnly = true)
    public AnalyticsExportResponse export() {
        List<Object[]> rows = applicationRepository.findAnalyticsSummary();
        List<AnalyticsExportResponse.JobAnalytics> jobs = rows.stream()
                .map(r -> new AnalyticsExportResponse.JobAnalytics(
                        (String) r[0],
                        toLong(r[1]),
                        toDouble(r[2]),
                        toLong(r[3]),
                        toLong(r[4]),
                        toLong(r[5])))
                .toList();
        return new AnalyticsExportResponse(jobs);
    }

    private long toLong(Object o) {
        if (o == null) return 0L;
        if (o instanceof Number n) return n.longValue();
        return Long.parseLong(o.toString());
    }

    private double toDouble(Object o) {
        if (o == null) return 0.0;
        if (o instanceof Number n) return n.doubleValue();
        return Double.parseDouble(o.toString());
    }
}
