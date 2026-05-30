package com.eaa.recruit.dto.application;

import java.util.List;

public record ExplanationResponse(
        Long   applicationId,
        Long   jobId,
        boolean available,
        List<AlignmentPair> strongMatches,
        List<AlignmentPair> weakMatches,
        List<String>        gaps
) {}
