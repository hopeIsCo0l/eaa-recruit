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

    public void activate()                     { this.active = true; }
    public void deactivate()                   { this.active = false; }
    public void changePassword(String newHash) { this.passwordHash = newHash; }
}
