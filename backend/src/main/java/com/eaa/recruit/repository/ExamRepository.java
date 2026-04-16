package com.eaa.recruit.repository;

import com.eaa.recruit.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ExamRepository extends JpaRepository<Exam, Long> {

    Optional<Exam> findByJobId(Long jobId);

    boolean existsByJobId(Long jobId);
}
