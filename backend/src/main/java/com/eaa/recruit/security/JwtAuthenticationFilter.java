package com.eaa.recruit.security;

import com.eaa.recruit.cache.BlockedUserCacheService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtTokenProvider        jwtTokenProvider;
    private final BlockedUserCacheService blockedUserCache;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider,
                                   BlockedUserCacheService blockedUserCache) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.blockedUserCache = blockedUserCache;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String token = resolveToken(request);

        if (StringUtils.hasText(token) && jwtTokenProvider.validateToken(token)) {
            Long   userId = jwtTokenProvider.extractUserId(token);
            String email  = jwtTokenProvider.extractEmail(token);
            String role   = jwtTokenProvider.extractRole(token);

            // Immediately reject tokens belonging to deactivated users
            if (blockedUserCache.isBlocked(userId)) {
                chain.doFilter(request, response);
                return;
            }

            AuthenticatedUser principal = new AuthenticatedUser(userId, email, role);
            List<SimpleGrantedAuthority> authorities =
                    List.of(new SimpleGrantedAuthority("ROLE_" + role));

            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(principal, null, authorities);
            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        chain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (StringUtils.hasText(bearer) && bearer.startsWith(BEARER_PREFIX)) {
            return bearer.substring(BEARER_PREFIX.length());
        }
        return null;
    }
}
