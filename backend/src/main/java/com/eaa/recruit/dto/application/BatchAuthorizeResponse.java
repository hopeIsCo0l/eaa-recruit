package com.eaa.recruit.dto.application;

import java.util.List;

public record BatchAuthorizeResponse(
        int            authorizedCount,
        List<Long>     authorizedIds,
        List<SkippedEntry> skipped
) {
    public record SkippedEntry(Long applicationId, String reason) {}
}
