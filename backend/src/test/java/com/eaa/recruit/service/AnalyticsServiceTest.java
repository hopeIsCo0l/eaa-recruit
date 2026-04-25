package com.eaa.recruit.service;

import com.eaa.recruit.dto.analytics.AnalyticsExportResponse;
import com.eaa.recruit.repository.ApplicationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock ApplicationRepository applicationRepository;

    AnalyticsService service;

    @BeforeEach
    void setUp() {
        service = new AnalyticsService(applicationRepository);
    }

    @Test
    void export_mapsRowsToJobAnalytics() {
        Object[] row = new Object[]{"Pilot", 10L, 75.5, 4L, 3L, 1L};
        List<Object[]> rows = new ArrayList<>();
        rows.add(row);
        when(applicationRepository.findAnalyticsSummary()).thenReturn(rows);

        AnalyticsExportResponse result = service.export();

        assertThat(result.jobs()).hasSize(1);
        AnalyticsExportResponse.JobAnalytics job = result.jobs().getFirst();
        assertThat(job.jobTitle()).isEqualTo("Pilot");
        assertThat(job.total()).isEqualTo(10L);
        assertThat(job.avgScore()).isEqualTo(75.5);
        assertThat(job.selected()).isEqualTo(4L);
        assertThat(job.rejected()).isEqualTo(3L);
        assertThat(job.waitlisted()).isEqualTo(1L);
    }

    @Test
    void export_handlesNullNumericFields() {
        Object[] row = new Object[]{"Navigator", 0L, null, null, null, null};
        List<Object[]> rows = new ArrayList<>();
        rows.add(row);
        when(applicationRepository.findAnalyticsSummary()).thenReturn(rows);

        AnalyticsExportResponse result = service.export();

        AnalyticsExportResponse.JobAnalytics job = result.jobs().getFirst();
        assertThat(job.avgScore()).isEqualTo(0.0);
        assertThat(job.selected()).isEqualTo(0L);
        assertThat(job.rejected()).isEqualTo(0L);
        assertThat(job.waitlisted()).isEqualTo(0L);
    }

    @Test
    void export_returnsEmptyList_whenNoApplications() {
        when(applicationRepository.findAnalyticsSummary()).thenReturn(List.of());

        AnalyticsExportResponse result = service.export();

        assertThat(result.jobs()).isEmpty();
    }

    @Test
    void export_handlesMultipleJobs() {
        Object[] row1 = new Object[]{"Pilot",     5L, 80.0, 2L, 2L, 0L};
        Object[] row2 = new Object[]{"Navigator", 3L, 60.0, 1L, 1L, 1L};
        List<Object[]> rows = new ArrayList<>();
        rows.add(row1);
        rows.add(row2);
        when(applicationRepository.findAnalyticsSummary()).thenReturn(rows);

        AnalyticsExportResponse result = service.export();

        assertThat(result.jobs()).hasSize(2);
        assertThat(result.jobs().get(0).jobTitle()).isEqualTo("Pilot");
        assertThat(result.jobs().get(1).jobTitle()).isEqualTo("Navigator");
    }
}
