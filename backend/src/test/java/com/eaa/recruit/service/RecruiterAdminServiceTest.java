package com.eaa.recruit.service;

import com.eaa.recruit.dto.admin.CreateRecruiterRequest;
import com.eaa.recruit.dto.admin.RecruiterCreatedResponse;
import com.eaa.recruit.entity.Role;
import com.eaa.recruit.entity.User;
import com.eaa.recruit.exception.ConflictException;
import com.eaa.recruit.notification.WelcomeNotificationPort;
import com.eaa.recruit.repository.UserRepository;
import com.eaa.recruit.security.AuthenticatedUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecruiterAdminServiceTest {

    @Mock UserRepository          userRepository;
    @Mock PasswordEncoder         passwordEncoder;
    @Mock WelcomeNotificationPort welcomeNotification;
    @Mock AuditLogService         auditLogService;

    RecruiterAdminService service;

    private static final AuthenticatedUser ADMIN =
            new AuthenticatedUser(7L, "admin@eaa.com", "ADMIN");

    @BeforeEach
    void setUp() {
        service = new RecruiterAdminService(userRepository, passwordEncoder, welcomeNotification, auditLogService);
    }

    private static CreateRecruiterRequest validRequest() {
        return new CreateRecruiterRequest("Bob Jones", "bob@example.com", "TempPass1!");
    }

    private static User savedRecruiter() {
        User u = User.create("bob@example.com", "$2a$hashed", Role.RECRUITER, "Bob Jones");
        u.activate();
        return u;
    }

    @Test
    void createRecruiter_createsActiveRecruiter_andSendsWelcome() {
        when(userRepository.existsByEmail("bob@example.com")).thenReturn(false);
        when(passwordEncoder.encode("TempPass1!")).thenReturn("$2a$hashed");
        when(userRepository.save(any(User.class))).thenReturn(savedRecruiter());

        RecruiterCreatedResponse resp = service.createRecruiter(validRequest(), ADMIN);

        assertThat(resp.email()).isEqualTo("bob@example.com");
        assertThat(resp.fullName()).isEqualTo("Bob Jones");

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().isActive()).isTrue();
        assertThat(captor.getValue().getRole()).isEqualTo(Role.RECRUITER);
        assertThat(captor.getValue().getPasswordHash()).isEqualTo("$2a$hashed");

        verify(welcomeNotification).sendRecruiterWelcome("bob@example.com", "Bob Jones", "TempPass1!");
    }

    @Test
    void createRecruiter_throwsConflict_onDuplicateEmail() {
        when(userRepository.existsByEmail("bob@example.com")).thenReturn(true);

        assertThatThrownBy(() -> service.createRecruiter(validRequest(), ADMIN))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("already registered");

        verify(userRepository, never()).save(any());
        verifyNoInteractions(welcomeNotification);
    }

    @Test
    void createRecruiter_stillSucceeds_whenWelcomeNotificationFails() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$hashed");
        when(userRepository.save(any())).thenReturn(savedRecruiter());
        doThrow(new RuntimeException("SMTP down"))
                .when(welcomeNotification).sendRecruiterWelcome(anyString(), anyString(), anyString());

        // Should not throw — notification failure is non-fatal
        RecruiterCreatedResponse resp = service.createRecruiter(validRequest(), ADMIN);
        assertThat(resp.email()).isEqualTo("bob@example.com");
    }

    @Test
    void createRecruiter_passwordIsHashed() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode("TempPass1!")).thenReturn("$2a$10$bcrypt");
        when(userRepository.save(any())).thenReturn(savedRecruiter());

        service.createRecruiter(validRequest(), ADMIN);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getPasswordHash()).isNotEqualTo("TempPass1!");
    }
}
