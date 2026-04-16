package com.eaa.recruit.repository;

import com.eaa.recruit.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByExamIdOrderByDisplayOrderAsc(Long examId);
}
