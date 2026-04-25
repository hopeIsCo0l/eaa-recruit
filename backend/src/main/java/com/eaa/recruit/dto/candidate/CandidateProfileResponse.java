package com.eaa.recruit.dto.candidate;

import com.eaa.recruit.entity.User;

public record CandidateProfileResponse(
        Integer heightCm,
        Integer weightKg,
        String  degree,
        String  fieldOfStudy,
        Integer graduationYear,
        String  phoneNumber
) {
    public static CandidateProfileResponse from(User user) {
        return new CandidateProfileResponse(
                user.getHeightCm(),
                user.getWeightKg(),
                user.getDegree(),
                user.getFieldOfStudy(),
                user.getGraduationYear(),
                user.getPhone()
        );
    }
}
