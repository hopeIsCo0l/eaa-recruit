package com.eaa.recruit.security.rbac;

import org.springframework.security.access.prepost.PreAuthorize;
import java.lang.annotation.*;

@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@PreAuthorize("hasRole('SUPER_ADMIN')")
public @interface IsSuperAdmin {}
