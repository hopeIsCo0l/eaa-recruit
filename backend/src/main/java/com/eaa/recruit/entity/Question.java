package com.eaa.recruit.entity;

import jakarta.persistence.*;

@Entity
@Table(
    name = "questions",
    indexes = @Index(name = "idx_questions_exam", columnList = "exam_id, display_order")
)
public class Question extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exam_id", nullable = false, updatable = false)
    private Exam exam;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private QuestionType type;

    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;

    /** JSON array of option strings — only set for MCQ questions. */
    @Column(name = "options", columnDefinition = "TEXT")
    private String options;

    /** Zero-based index of the correct option — only set for MCQ questions. */
    @Column(name = "correct_answer")
    private Integer correctAnswer;

    @Column(name = "marks", nullable = false)
    private Integer marks;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    protected Question() {}

    private Question(Exam exam, QuestionType type, String questionText,
                     String options, Integer correctAnswer,
                     Integer marks, Integer displayOrder) {
        this.exam          = exam;
        this.type          = type;
        this.questionText  = questionText;
        this.options       = options;
        this.correctAnswer = correctAnswer;
        this.marks         = marks;
        this.displayOrder  = displayOrder;
    }

    public static Question create(Exam exam, QuestionType type, String questionText,
                                   String options, Integer correctAnswer,
                                   Integer marks, Integer displayOrder) {
        return new Question(exam, type, questionText, options, correctAnswer, marks, displayOrder);
    }

    public Exam         getExam()         { return exam; }
    public QuestionType getType()         { return type; }
    public String       getQuestionText() { return questionText; }
    public String       getOptions()      { return options; }
    public Integer      getCorrectAnswer(){ return correctAnswer; }
    public Integer      getMarks()        { return marks; }
    public Integer      getDisplayOrder() { return displayOrder; }
}
