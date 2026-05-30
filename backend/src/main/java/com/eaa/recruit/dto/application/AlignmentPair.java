package com.eaa.recruit.dto.application;

public record AlignmentPair(
        String cvChunk,
        String jdChunk,
        double similarity
) {}
