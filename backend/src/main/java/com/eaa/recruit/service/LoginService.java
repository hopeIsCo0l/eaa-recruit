package com.eaa.recruit.service;

import com.eaa.recruit.dto.auth.LoginRequest;
import com.eaa.recruit.dto.auth.LoginResponse;
import com.eaa.recruit.entity.User;
import com.eaa.recruit.exception.UnauthorizedException;
import com.eaa.recruit.repository.UserRepository;
import com.eaa.recruit.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LoginService {

    private final UserRepository    userRepository;
    private final PasswordEncoder   passwordEncoder;
    private final JwtTokenProvider  jwtTokenProvider;
    private final AuditLogService   auditLogService;

    public LoginService(UserRepository userRepository,
                        PasswordEncoder passwordEncoder,
                        JwtTokenProvider jwtTokenProvider,
                        AuditLogService auditLogService) {
        this.userRepository   = userRepository;
        this.passwordEncoder  = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.auditLogService  = auditLogService;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email()).orElse(null);

        if (user == null || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            Long uid = user != null && user.getId() != null ? user.getId() : 0L;
            auditLogService.log("USER", uid, null, "LOGIN_FAILED", null,
                    "Bad credentials for " + request.email());
            throw new UnauthorizedException("Invalid email or password");
        }

        if (!user.isActive()) {
            auditLogService.log("USER", user.getId(), null, "LOGIN_BLOCKED", user,
                    "Account not yet activated");
            throw new UnauthorizedException("Account is not yet activated. Please verify your email.");
        }

        String token = jwtTokenProvider.generateToken(
                user.getId(), user.getRole().name(), user.getEmail());

        auditLogService.log("USER", user.getId(), null, "LOGIN_SUCCESS", user, null);

        return new LoginResponse(token, user.getId(), user.getEmail(),
                user.getRole().name(), user.getFullName());
    }
}
