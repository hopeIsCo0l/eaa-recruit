package com.eaa.recruit.dto.application;

public record ShortlistResponse(
        int shortlisted,
        int skipped
) {}
