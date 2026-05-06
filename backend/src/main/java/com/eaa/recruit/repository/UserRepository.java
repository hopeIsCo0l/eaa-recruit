package com.eaa.recruit.repository;

import com.eaa.recruit.entity.Role;
import com.eaa.recruit.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByRole(Role role);

    List<User> findByRoleOrderByCreatedAtDesc(Role role);

    List<User> findAllByOrderByCreatedAtDesc();
}
