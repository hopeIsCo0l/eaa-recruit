package com.eaa.recruit.entity;

import jakarta.persistence.*;

@Entity
@Table(
    name = "users",
    indexes = {
        @Index(name = "idx_users_email", columnList = "email", unique = true)
    }
)
public class User extends BaseEntity {

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private Role role;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "is_active", nullable = false)
    private boolean active = false;

    /** Candidate profile fields — nullable; only populated for CANDIDATE role. */
    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "height_cm")
    private Integer heightCm;

    @Column(name = "weight_kg")
    private Integer weightKg;

    @Column(name = "degree", length = 100)
    private String degree;

    @Column(name = "field_of_study", length = 150)
    private String fieldOfStudy;

    @Column(name = "graduation_year")
    private Integer graduationYear;

    protected User() {}

    private User(String email, String passwordHash, Role role, String fullName) {
        this.email        = email;
        this.passwordHash = passwordHash;
        this.role         = role;
        this.fullName     = fullName;
    }

    public static User create(String email, String passwordHash, Role role, String fullName) {
        return new User(email, passwordHash, role, fullName);
    }

    public String getEmail()        { return email; }
    public String getPasswordHash() { return passwordHash; }
    public Role   getRole()         { return role; }
    public String getFullName()     { return fullName; }
    public boolean isActive()       { return active; }

    public String  getPhone()          { return phone; }
    public Integer getHeightCm()       { return heightCm; }
    public Integer getWeightKg()       { return weightKg; }
    public String  getDegree()         { return degree; }
    public String  getFieldOfStudy()   { return fieldOfStudy; }
    public Integer getGraduationYear() { return graduationYear; }

    public void activate()                     { this.active = true; }
    public void deactivate()                   { this.active = false; }
    public void changePassword(String newHash) { this.passwordHash = newHash; }

    public void updateProfile(Integer heightCm, Integer weightKg, String degree,
                               String fieldOfStudy, Integer graduationYear, String phone) {
        this.heightCm       = heightCm;
        this.weightKg       = weightKg;
        this.degree         = degree;
        this.fieldOfStudy   = fieldOfStudy;
        this.graduationYear = graduationYear;
        this.phone          = phone;
    }
}
