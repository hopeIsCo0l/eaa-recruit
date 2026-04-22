package com.eaa.recruit.repository;

import com.eaa.recruit.entity.AiModelVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AiModelVersionRepository extends JpaRepository<AiModelVersion, Long> {

    Optional<AiModelVersion> findByActiveTrue();

    boolean existsByModelVersion(String modelVersion);

    List<AiModelVersion> findAllByOrderByCreatedAtDesc();

    @Modifying
    @Query("UPDATE AiModelVersion v SET v.active = false WHERE v.active = true")
    void deactivateAll();
}
