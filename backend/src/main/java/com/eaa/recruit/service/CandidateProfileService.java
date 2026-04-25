package com.eaa.recruit.service;

import com.eaa.recruit.dto.candidate.CandidateProfileRequest;
import com.eaa.recruit.dto.candidate.CandidateProfileResponse;
import com.eaa.recruit.entity.User;
import com.eaa.recruit.exception.ResourceNotFoundException;
import com.eaa.recruit.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CandidateProfileService {

    private final UserRepository userRepository;

    public CandidateProfileService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public CandidateProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        return CandidateProfileResponse.from(user);
    }

    @Transactional
    public CandidateProfileResponse updateProfile(Long userId, CandidateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        user.updateProfile(
                request.heightCm(),
                request.weightKg(),
                request.degree(),
                request.fieldOfStudy(),
                request.graduationYear(),
                request.phoneNumber()
        );
        return CandidateProfileResponse.from(userRepository.save(user));
    }
}
