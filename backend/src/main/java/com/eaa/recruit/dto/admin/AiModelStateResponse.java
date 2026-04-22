package com.eaa.recruit.dto.admin;

import java.util.List;

public record AiModelStateResponse(
        AiModelResponse current,
        List<AiModelResponse> history
) {}
