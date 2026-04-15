package com.eaa.recruit.service;

import com.eaa.recruit.cache.BlockedUserCacheService;
import com.eaa.recruit.entity.Role;
import com.eaa.recruit.entity.User;
import com.eaa.recruit.exception.BusinessException;
import com.eaa.recruit.exception.ResourceNotFoundException;
import com.eaa.recruit.repository.UserRepository;
import com.eaa.recruit.security.AuthenticatedUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserStatusService {

    private static final Logger log = LoggerFactory.getLogger(UserStatusService.class);

    private final UserRepository          userRepository;
    private final BlockedUserCacheService blockedUserCache;

    public UserStatusService(UserRepository userRepository,
                             BlockedUserCacheService blockedUserCache) {
        this.userRepository   = userRepository;
        this.blockedUserCache = blockedUserCache;
    }

    /**
     * Activates or deactivates a user account.
     *
     * Rules:
     * - Target user must exist (404 otherwise)
     * - Admins cannot deactivate SUPER_ADMIN accounts
     * - Deactivation immediately blocks existing JWTs via Redis
     * - Activation removes the Redis block
     *
     * @param targetId  ID of the user to update
     * @param active    desired state
     * @param requester the authenticated admin performing the action
     */
    @Transactional
    public void setStatus(Long targetId, boolean active, AuthenticatedUser requester) {
        User target = userRepository.findById(targetId)
                .orElseThrow(() -> new ResourceNotFoundException("User", targetId));

        // Admins (non-super) cannot touch SUPER_ADMIN accounts
        if (target.getRole() == Role.SUPER_ADMIN
                && !requester.role().equals(Role.SUPER_ADMIN.name())) {
            throw new BusinessException("Admins cannot modify Super Admin accounts");
        }

        if (active) {
            target.activate();
            blockedUserCache.unblock(targetId);
            log.info("User id={} activated by admin id={}", targetId, requester.id());
        } else {
            target.deactivate();
            blockedUserCache.block(targetId);
            log.info("User id={} deactivated by admin id={}", targetId, requester.id());
        }
    }
}
