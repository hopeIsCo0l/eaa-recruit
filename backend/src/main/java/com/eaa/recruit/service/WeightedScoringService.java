package com.eaa.recruit.service;

import com.eaa.recruit.entity.Application;
import com.eaa.recruit.repository.ApplicationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * FR-28: Compute weighted final score.
 * Formula: (cvRelevanceScore * 100 * 0.4) + (examScore * 0.4) + (hardFilterPass ? 100 : 0) * 0.2
 * If hard filter failed, final score is forced to 0.
 */
@Service
public class WeightedScoringService {

    private static final Logger log = LoggerFactory.getLogger(WeightedScoringService.class);

    private final ApplicationRepository applicationRepository;

    public WeightedScoringService(ApplicationRepository applicationRepository) {
        this.applicationRepository = applicationRepository;
    }

    @Transactional
    public double computeAndPersist(Application application) {
        double score = compute(application);
        application.updateFinalScore(score);
        applicationRepository.save(application);
        log.info("Final score computed applicationId={} score={}", application.getId(), score);
        return score;
    }

    public double compute(Application application) {
        Boolean hardFilterPassed = application.getHardFilterPassed();

        // Hard filter fail overrides everything
        if (Boolean.FALSE.equals(hardFilterPassed)) {
            return 0.0;
        }

        double cvComponent   = (application.getCvRelevanceScore() != null
                                ? application.getCvRelevanceScore() * 100 * 0.4 : 0.0);
        double examComponent = (application.getExamScore() != null
                                ? application.getExamScore() * 0.4 : 0.0);
        double hfComponent   = Boolean.TRUE.equals(hardFilterPassed) ? 100 * 0.2 : 0.0;

        double total = cvComponent + examComponent + hfComponent;
        return Math.round(total * 100.0) / 100.0;
    }
}
