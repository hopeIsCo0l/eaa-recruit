package com.eaa.recruit.repository;

import com.eaa.recruit.entity.Role;
import com.eaa.recruit.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired UserRepository userRepository;

    @Test
    void saveAndFindByEmail() {
        userRepository.save(User.create("alice@example.com", "$2a$bcrypt", Role.CANDIDATE, "Alice"));

        Optional<User> found = userRepository.findByEmail("alice@example.com");
        assertThat(found).isPresent();
        assertThat(found.get().getRole()).isEqualTo(Role.CANDIDATE);
        assertThat(found.get().isActive()).isFalse();
        assertThat(found.get().getCreatedAt()).isNotNull();
        assertThat(found.get().getUpdatedAt()).isNotNull();
    }

    @Test
    void existsByEmail() {
        userRepository.save(User.create("bob@example.com", "hash", Role.RECRUITER, "Bob"));
        assertThat(userRepository.existsByEmail("bob@example.com")).isTrue();
        assertThat(userRepository.existsByEmail("unknown@example.com")).isFalse();
    }

    @Test
    void emailIsUnique() {
        userRepository.save(User.create("dup@example.com", "hash", Role.CANDIDATE, "D1"));
        assertThatThrownBy(() ->
            userRepository.saveAndFlush(User.create("dup@example.com", "h2", Role.CANDIDATE, "D2"))
        ).isInstanceOf(Exception.class);
    }

    @Test
    void countByRole() {
        userRepository.save(User.create("c1@example.com", "h", Role.CANDIDATE, "C1"));
        userRepository.save(User.create("c2@example.com", "h", Role.CANDIDATE, "C2"));
        userRepository.save(User.create("r1@example.com", "h", Role.RECRUITER, "R1"));

        assertThat(userRepository.countByRole(Role.CANDIDATE)).isEqualTo(2);
        assertThat(userRepository.countByRole(Role.RECRUITER)).isEqualTo(1);
        assertThat(userRepository.countByRole(Role.ADMIN)).isEqualTo(0);
    }

    @Test
    void passwordHashStoredAsIs() {
        userRepository.save(User.create("safe@example.com", "$2a$10$hashed", Role.CANDIDATE, "S"));
        assertThat(userRepository.findByEmail("safe@example.com").orElseThrow()
                .getPasswordHash()).startsWith("$2a$");
    }
}
