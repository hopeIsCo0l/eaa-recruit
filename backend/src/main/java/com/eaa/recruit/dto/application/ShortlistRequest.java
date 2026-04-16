package com.eaa.recruit.dto.application;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record ShortlistRequest(

        @NotEmpty(message = "applicationIds must not be empty")
        List<Long> applicationIds
) {}
