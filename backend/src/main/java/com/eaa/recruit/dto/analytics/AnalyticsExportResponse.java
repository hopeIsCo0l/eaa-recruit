package com.eaa.recruit.dto.analytics;

import java.util.List;

public record AnalyticsExportResponse(
        List<JobAnalytics> jobs
) {

    public record JobAnalytics(
            String jobTitle,
            long total,
            double avgScore,
            long selected,
            long rejected,
            long waitlisted
    ) {}
}
