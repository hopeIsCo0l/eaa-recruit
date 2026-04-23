package com.eaa.recruit.security.rbac;

import org.springframework.security.access.prepost.PreAuthorize;
import java.lang.annotation.*;

/** Any authenticated user (any role). */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@PreAuthorize("isAuthenticated()")
public @interface IsAuthenticated {}
