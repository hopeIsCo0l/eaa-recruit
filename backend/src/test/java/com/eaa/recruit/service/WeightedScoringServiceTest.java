package com.eaa.recruit.service;

import com.eaa.recruit.entity.*;
import com.eaa.recruit.repository.ApplicationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.offset;

@ExtendWith(MockitoExtension.class)
class WeightedScoringServiceTest {

    @Mock ApplicationRepository applicationRepository;

    WeightedScoringService service;

    @BeforeEach
    void setUp() {
        service = new WeightedScoringService(applicationRepository);
    }

    private Application makeApp(double cvScore, double examScore, Boolean hfPassed) {
        User recruiter  = User.create("r@eaa.com", "hash", Role.RECRUITER, "Alice");
        JobPosting job  = JobPosting.create("Pilot", "desc", 170, 60, "BSc",
                LocalDate.now(), LocalDate.now().plusDays(30), LocalDate.now().plusDays(37), recruiter);
        User candidate  = User.create("c@eaa.com", "hash", Role.CANDIDATE, "Bob");
        Application app = Application.create(candidate, job, "cv.pdf");
        app.applyAiScore(cvScore, "url");
        if (Boolean.TRUE.equals(hfPassed))  app.markHardFilterPassed();
        if (Boolean.FALSE.equals(hfPassed)) app.markHardFilterFailed();
        app.authorizeExam("token");
        app.recordExamScore(examScore, 0.0); // finalScore placeholder
        return app;
    }

    @Test
    void compute_fullScore_whenAllPassed() {
        Application app = makeApp(1.0, 100.0, true);
        // (1.0 * 100 * 0.4) + (100.0 * 0.4) + (100 * 0.2) = 40 + 40 + 20 = 100
        double score = service.compute(app);
        assertThat(score).isCloseTo(100.0, offset(0.001));
    }

    @Test
    void compute_zeroScore_whenHardFilterFailed() {
        Application app = makeApp(0.9, 85.0, false);
        assertThat(service.compute(app)).isEqualTo(0.0);
    }

    @Test
    void compute_partialScore_whenHardFilterPassedWithLowerScores() {
        Application app = makeApp(0.5, 50.0, true);
        // (0.5 * 100 * 0.4) + (50 * 0.4) + (100 * 0.2) = 20 + 20 + 20 = 60
        assertThat(service.compute(app)).isCloseTo(60.0, offset(0.001));
    }
}
