package com.eaa.recruit.entity;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "exams")
public class Exam extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "job_id", nullable = false, unique = true, updatable = false)
    private JobPosting job;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @OneToMany(mappedBy = "exam", cascade = CascadeType.ALL, orphanRemoval = true,
               fetch = FetchType.LAZY)
    @OrderBy("displayOrder ASC")
    private List<Question> questions = new ArrayList<>();

    protected Exam() {}

    private Exam(JobPosting job, String title, Integer durationMinutes) {
        this.job             = job;
        this.title           = title;
        this.durationMinutes = durationMinutes;
    }

    public static Exam create(JobPosting job, String title, Integer durationMinutes) {
        return new Exam(job, title, durationMinutes);
    }

    public JobPosting    getJob()             { return job; }
    public String        getTitle()           { return title; }
    public Integer       getDurationMinutes() { return durationMinutes; }
    public List<Question> getQuestions()      { return questions; }

    public void addQuestion(Question question) {
        questions.add(question);
    }
}
