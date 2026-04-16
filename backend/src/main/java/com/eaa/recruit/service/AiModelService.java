package com.eaa.recruit.service;

import com.eaa.recruit.dto.admin.AiModelRequest;
import com.eaa.recruit.dto.admin.AiModelResponse;
import com.eaa.recruit.entity.AiModelVersion;
import com.eaa.recruit.entity.User;
import com.eaa.recruit.exception.BusinessException;
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

    public AiModelService(AiModelVersionRepository aiModelVersionRepository,
                           UserRepository userRepository) {
        this.aiModelVersionRepository = aiModelVersionRepository;
        this.userRepository           = userRepository;
    }

    @Transactional
    public AiModelResponse register(AiModelRequest request, AuthenticatedUser principal) {
        if (aiModelVersionRepository.existsByModelVersion(request.modelVersion())) {
            throw new ConflictException("Model version already registered: " + request.modelVersion());
        }

        User creator = userRepository.findById(principal.id())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        AiModelVersion model = AiModelVersion.create(request.modelVersion(), request.description(), creator);
        model = aiModelVersionRepository.save(model);
        return toResponse(model);
    }

    @Transactional
    public AiModelResponse activate(Long modelId) {
        AiModelVersion model = aiModelVersionRepository.findById(modelId)
                .orElseThrow(() -> new ResourceNotFoundException("Model not found: " + modelId));

        if (model.isActive()) {
            throw new BusinessException("Model is already active");
        }

        // Deactivate current active model, then activate new one
        aiModelVersionRepository.deactivateAll();
        model.activate();
        aiModelVersionRepository.save(model);
        return toResponse(model);
    }

    @Transactional(readOnly = true)
    public List<AiModelResponse> listAll() {
        return aiModelVersionRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AiModelResponse getActive() {
        return aiModelVersionRepository.findByActiveTrue()
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("No active AI model version found"));
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
