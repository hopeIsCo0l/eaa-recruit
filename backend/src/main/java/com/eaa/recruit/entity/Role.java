package com.eaa.recruit.entity;

/**
 * System roles in ascending privilege order.
 * Value stored in DB as a string (EnumType.STRING).
 *
 * Spring Security authority name = "ROLE_" + name()
 * e.g.  CANDIDATE  →  ROLE_CANDIDATE
 */
public enum Role {
    CANDIDATE,
    RECRUITER,
    ADMIN,
    SUPER_ADMIN
}
