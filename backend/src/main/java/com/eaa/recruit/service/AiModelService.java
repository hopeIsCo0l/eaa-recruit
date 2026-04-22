package com.eaa.recruit.service;

import com.eaa.recruit.dto.admin.AiModelRequest;
import com.eaa.recruit.dto.admin.AiModelResponse;
import com.eaa.recruit.dto.admin.AiModelStateResponse;
import com.eaa.recruit.entity.AiModelVersion;
import com.eaa.recruit.entity.User;
import com.eaa.recruit.exception.ConflictException;
import com.eaa.recruit.exception.ResourceNotFoundException;
import com.eaa.recruit.repository.AiModelVersionRepository;
import com.eaa.recruit.repository.UserRepository;
import com.eaa.recruit.security.AuthenticatedUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * FR-39: Super admin manages AI model version registry.
 */
@Service
public class AiModelService {

    private final AiModelVersionRepository aiModelVersionRepository;
    private final UserRepository            userRepository;
    private final AuditLogService           auditLogService;

    public AiModelService(AiModelVersionRepository aiModelVersionRepository,
                           UserRepository userRepository,
                           AuditLogService auditLogService) {
        this.aiModelVersionRepository = aiModelVersionRepository;
        this.userRepository           = userRepository;
        this.auditLogService          = auditLogService;
    }

    /** FR-39: register new version, set active, audit. */
    @Transactional
    public AiModelStateResponse update(AiModelRequest request, AuthenticatedUser principal) {
        if (aiModelVersionRepository.existsByModelVersion(request.modelVersion())) {
            throw new ConflictException("Model version already registered: " + request.modelVersion());
        }

        User actor = userRepository.findById(principal.id())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String previousVersion = aiModelVersionRepository.findByActiveTrue()
                .map(AiModelVersion::getModelVersion)
                .orElse(null);

        aiModelVersionRepository.deactivateAll();

        AiModelVersion model = AiModelVersion.create(
                request.modelVersion(), request.description(), request.activatedAt(), actor);
        model.activate();
        model = aiModelVersionRepository.save(model);

        auditLogService.log("AI_MODEL", model.getId(), previousVersion,
                model.getModelVersion(), actor, "Active model updated");

        return getState();
    }

    @Transactional(readOnly = true)
    public AiModelStateResponse getState() {
        List<AiModelResponse> history = aiModelVersionRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).toList();
        AiModelResponse current = aiModelVersionRepository.findByActiveTrue()
                .map(this::toResponse).orElse(null);
        return new AiModelStateResponse(current, history);
    }

    private AiModelResponse toResponse(AiModelVersion m) {
        return new AiModelResponse(
                m.getId(),
                m.getModelVersion(),
                m.getDescription(),
                m.isActive(),
                m.getActivatedAt(),
                m.getCreatedAt());
    }
}
