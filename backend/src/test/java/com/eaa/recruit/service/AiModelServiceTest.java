package com.eaa.recruit.service;

import com.eaa.recruit.dto.admin.AiModelRequest;
import com.eaa.recruit.dto.admin.AiModelStateResponse;
import com.eaa.recruit.entity.AiModelVersion;
import com.eaa.recruit.entity.Role;
import com.eaa.recruit.entity.User;
import com.eaa.recruit.exception.ConflictException;
import com.eaa.recruit.repository.AiModelVersionRepository;
import com.eaa.recruit.repository.UserRepository;
import com.eaa.recruit.security.AuthenticatedUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiModelServiceTest {

    @Mock AiModelVersionRepository repository;
    @Mock UserRepository           userRepository;
    @Mock AuditLogService          auditLogService;

    AiModelService service;

    private static final AuthenticatedUser SUPER_ADMIN =
            new AuthenticatedUser(1L, "su@eaa.com", "SUPER_ADMIN");

    @BeforeEach
    void setUp() {
        service = new AiModelService(repository, userRepository, auditLogService);
    }

    @Test
    void update_activatesNewVersion_andAuditsTransition() {
        User actor = User.create("su@eaa.com", "hash", Role.SUPER_ADMIN, "Su");
        AiModelVersion previous = AiModelVersion.create("v1.0", "old", Instant.now(), actor);
        previous.activate();

        when(repository.existsByModelVersion("v2.0")).thenReturn(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(actor));
        when(repository.findByActiveTrue()).thenReturn(Optional.of(previous));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(repository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(previous));

        AiModelStateResponse response = service.update(
                new AiModelRequest("v2.0", "new", Instant.now()), SUPER_ADMIN);

        assertThat(response).isNotNull();
        verify(repository).deactivateAll();
        verify(auditLogService).log(eq("AI_MODEL"), any(), eq("v1.0"), eq("v2.0"), eq(actor), any());
    }

    @Test
    void update_throwsConflict_whenVersionAlreadyExists() {
        when(repository.existsByModelVersion("v1.0")).thenReturn(true);

        assertThatThrownBy(() -> service.update(
                new AiModelRequest("v1.0", "dup", null), SUPER_ADMIN))
                .isInstanceOf(ConflictException.class);

        verify(repository, never()).save(any());
        verifyNoInteractions(auditLogService);
    }
}
