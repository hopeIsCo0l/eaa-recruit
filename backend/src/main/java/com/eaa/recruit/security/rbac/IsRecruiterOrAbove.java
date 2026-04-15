package com.eaa.recruit.security.rbac;

import org.springframework.security.access.prepost.PreAuthorize;
import java.lang.annotation.*;

/** Recruiter, Admin, or Super Admin. */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN', 'SUPER_ADMIN')")
public @interface IsRecruiterOrAbove {}
