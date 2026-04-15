package com.eaa.recruit.entity;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class UserTest {

    @Test void newUser_isInactive() {
        assertThat(User.create("a@b.com", "hash", Role.CANDIDATE, "Alice").isActive()).isFalse();
    }

    @Test void activate_setsActiveTrue() {
        User u = User.create("a@b.com", "hash", Role.CANDIDATE, "Alice");
        u.activate();
        assertThat(u.isActive()).isTrue();
    }

    @Test void deactivate_setsActiveFalse() {
        User u = User.create("a@b.com", "hash", Role.RECRUITER, "Bob");
        u.activate();
        u.deactivate();
        assertThat(u.isActive()).isFalse();
    }

    @Test void changePassword_updatesHash() {
        User u = User.create("a@b.com", "old", Role.CANDIDATE, "Alice");
        u.changePassword("new");
        assertThat(u.getPasswordHash()).isEqualTo("new");
    }

    @Test void rolesPreserved() {
        assertThat(User.create("a@b.com", "h", Role.ADMIN, "A").getRole()).isEqualTo(Role.ADMIN);
        assertThat(User.create("b@b.com", "h", Role.SUPER_ADMIN, "S").getRole()).isEqualTo(Role.SUPER_ADMIN);
    }
}
