package com.eaa.recruit.service;

import com.eaa.recruit.cache.BlockedUserCacheService;
import com.eaa.recruit.entity.Role;
import com.eaa.recruit.entity.User;
import com.eaa.recruit.exception.BusinessException;
import com.eaa.recruit.exception.ResourceNotFoundException;
import com.eaa.recruit.repository.UserRepository;
import com.eaa.recruit.security.AuthenticatedUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserStatusServiceTest {

    @Mock UserRepository          userRepository;
    @Mock BlockedUserCacheService blockedUserCache;

    UserStatusService service;

    private static final AuthenticatedUser ADMIN      = new AuthenticatedUser(1L, "admin@x.com", "ADMIN");
    private static final AuthenticatedUser SUPER_ADMIN = new AuthenticatedUser(2L, "sa@x.com", "SUPER_ADMIN");

    @BeforeEach
    void setUp() {
        service = new UserStatusService(userRepository, blockedUserCache);
    }

    private User activeCandidate(Long id) {
        User u = User.create("c@x.com", "h", Role.CANDIDATE, "Cand");
        u.activate();
        return u;
    }

    private User activeSuperAdmin() {
        User u = User.create("sa@x.com", "h", Role.SUPER_ADMIN, "SA");
        u.activate();
        return u;
    }

    // ── deactivate ────────────────────────────────────────────────────────────

    @Test
    void deactivate_setsInactiveAndBlocksInRedis() {
        User user = activeCandidate(10L);
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));

        service.setStatus(10L, false, ADMIN);

        assertThat(user.isActive()).isFalse();
        verify(blockedUserCache).block(10L);
        verify(blockedUserCache, never()).unblock(any());
    }

    // ── activate ──────────────────────────────────────────────────────────────

    @Test
    void activate_setsActiveAndUnblocksInRedis() {
        User user = User.create("c@x.com", "h", Role.CANDIDATE, "Cand"); // inactive
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));

        service.setStatus(10L, true, ADMIN);

        assertThat(user.isActive()).isTrue();
        verify(blockedUserCache).unblock(10L);
        verify(blockedUserCache, never()).block(any());
    }

    // ── guard: admin cannot touch SUPER_ADMIN ────────────────────────────────

    @Test
    void admin_cannotDeactivateSuperAdmin() {
        when(userRepository.findById(99L)).thenReturn(Optional.of(activeSuperAdmin()));

        assertThatThrownBy(() -> service.setStatus(99L, false, ADMIN))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Super Admin");

        verifyNoInteractions(blockedUserCache);
    }

    @Test
    void superAdmin_canDeactivateSuperAdmin() {
        User sa = activeSuperAdmin();
        when(userRepository.findById(99L)).thenReturn(Optional.of(sa));

        service.setStatus(99L, false, SUPER_ADMIN);

        assertThat(sa.isActive()).isFalse();
        verify(blockedUserCache).block(99L);
    }

    // ── not found ─────────────────────────────────────────────────────────────

    @Test
    void throwsNotFound_whenUserMissing() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.setStatus(999L, false, ADMIN))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
