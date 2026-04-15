package com.eaa.recruit.dto.admin;

import jakarta.validation.constraints.NotNull;

public record UserStatusRequest(
        @NotNull(message = "active field is required")
        Boolean active
) {}
