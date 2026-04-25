package com.eaa.recruit.service;

import com.eaa.recruit.dto.candidate.CandidateProfileRequest;
import com.eaa.recruit.dto.candidate.CandidateProfileResponse;
import com.eaa.recruit.entity.Role;
import com.eaa.recruit.entity.User;
import com.eaa.recruit.exception.ResourceNotFoundException;
import com.eaa.recruit.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CandidateProfileServiceTest {

    @Mock UserRepository userRepository;

    CandidateProfileService service;

    @BeforeEach
    void setUp() {
        service = new CandidateProfileService(userRepository);
    }

    private User blankCandidate() {
        return User.create("candidate@eaa.com", "hash", Role.CANDIDATE, "Test User");
    }

    @Test
    void getProfile_returnsCurrentValues() {
        User user = blankCandidate();
        user.updateProfile(175, 70, "Bachelor", "CS", 2020, "+1234");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        CandidateProfileResponse resp = service.getProfile(1L);

        assertThat(resp.heightCm()).isEqualTo(175);
        assertThat(resp.weightKg()).isEqualTo(70);
        assertThat(resp.degree()).isEqualTo("Bachelor");
        assertThat(resp.fieldOfStudy()).isEqualTo("CS");
        assertThat(resp.graduationYear()).isEqualTo(2020);
        assertThat(resp.phoneNumber()).isEqualTo("+1234");
    }

    @Test
    void getProfile_nullFields_whenProfileNotYetSet() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(blankCandidate()));

        CandidateProfileResponse resp = service.getProfile(2L);

        assertThat(resp.heightCm()).isNull();
        assertThat(resp.degree()).isNull();
    }

    @Test
    void getProfile_throwsNotFound_whenUserMissing() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getProfile(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void updateProfile_persistsAllFields() {
        User user = blankCandidate();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        CandidateProfileRequest req = new CandidateProfileRequest(180, 75, "Master", "Aviation", 2018, "+9999");
        CandidateProfileResponse resp = service.updateProfile(1L, req);

        assertThat(resp.heightCm()).isEqualTo(180);
        assertThat(resp.weightKg()).isEqualTo(75);
        assertThat(resp.degree()).isEqualTo("Master");
        assertThat(resp.fieldOfStudy()).isEqualTo("Aviation");
        assertThat(resp.graduationYear()).isEqualTo(2018);
        assertThat(resp.phoneNumber()).isEqualTo("+9999");
        verify(userRepository).save(user);
    }

    @Test
    void updateProfile_throwsNotFound_whenUserMissing() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        CandidateProfileRequest req = new CandidateProfileRequest(175, 70, "Bachelor", "CS", 2020, null);
        assertThatThrownBy(() -> service.updateProfile(99L, req))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(userRepository, never()).save(any());
    }
}
