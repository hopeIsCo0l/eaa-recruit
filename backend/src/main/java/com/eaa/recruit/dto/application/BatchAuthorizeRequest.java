package com.eaa.recruit.dto.application;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record BatchAuthorizeRequest(

        @NotEmpty(message = "At least one applicationId is required")
        List<Long> applicationIds
) {}
