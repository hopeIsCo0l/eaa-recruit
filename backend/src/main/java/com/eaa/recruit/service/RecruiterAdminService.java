package com.eaa.recruit.service;

import com.eaa.recruit.dto.admin.CreateRecruiterRequest;
import com.eaa.recruit.dto.admin.RecruiterCreatedResponse;
import com.eaa.recruit.entity.Role;
import com.eaa.recruit.entity.User;
import com.eaa.recruit.exception.ConflictException;
import com.eaa.recruit.notification.WelcomeNotificationPort;
import com.eaa.recruit.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RecruiterAdminService {

    private static final Logger log = LoggerFactory.getLogger(RecruiterAdminService.class);

    private final UserRepository          userRepository;
    private final PasswordEncoder         passwordEncoder;
    private final WelcomeNotificationPort welcomeNotification;

    public RecruiterAdminService(UserRepository userRepository,
                                 PasswordEncoder passwordEncoder,
                                 WelcomeNotificationPort welcomeNotification) {
        this.userRepository     = userRepository;
        this.passwordEncoder    = passwordEncoder;
        this.welcomeNotification = welcomeNotification;
    }

    @Transactional
    public RecruiterCreatedResponse createRecruiter(CreateRecruiterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email is already registered: " + request.email());
        }

        String hash = passwordEncoder.encode(request.temporaryPassword());
        User recruiter = User.create(request.email(), hash, Role.RECRUITER, request.fullName());
        recruiter.activate();
        recruiter = userRepository.save(recruiter);

        log.info("Recruiter account created id={} email='{}'", recruiter.getId(), recruiter.getEmail());

        try {
            welcomeNotification.sendRecruiterWelcome(
                    recruiter.getEmail(), recruiter.getFullName(), request.temporaryPassword());
        } catch (Exception ex) {
            log.error("Welcome notification failed for recruiter email='{}': {}",
                    recruiter.getEmail(), ex.getMessage(), ex);
        }

        return new RecruiterCreatedResponse(
                recruiter.getId(), recruiter.getEmail(),
                recruiter.getFullName(), "Recruiter account created successfully");
    }
}
