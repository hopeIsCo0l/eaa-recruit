package com.eaa.recruit.service;

import com.eaa.recruit.dto.admin.SystemHealthResponse;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.lang.management.ManagementFactory;
import java.util.Properties;

/**
 * FR-38: System health — DB pool, Redis, uptime.
 */
@Service
public class SystemHealthService {

    private static final Logger log = LoggerFactory.getLogger(SystemHealthService.class);

    private final HikariDataSource              dataSource;
    private final RedisTemplate<String, String> redisTemplate;

    public SystemHealthService(HikariDataSource dataSource,
                                RedisTemplate<String, String> redisTemplate) {
        this.dataSource    = dataSource;
        this.redisTemplate = redisTemplate;
    }

    public SystemHealthResponse getHealth() {
        return new SystemHealthResponse(
                dbHealth(),
                redisHealth(),
                uptimeSeconds());
    }

    private SystemHealthResponse.DatabaseHealth dbHealth() {
        try {
            var pool = dataSource.getHikariPoolMXBean();
            return new SystemHealthResponse.DatabaseHealth(
                    true,
                    pool.getActiveConnections(),
                    pool.getIdleConnections());
        } catch (Exception e) {
            log.warn("DB health check failed: {}", e.getMessage());
            return new SystemHealthResponse.DatabaseHealth(false, 0, 0);
        }
    }

    private SystemHealthResponse.RedisHealth redisHealth() {
        try {
            Properties info = redisTemplate.getConnectionFactory()
                    .getConnection()
                    .serverCommands()
                    .info("server");
            String version = info != null ? info.getProperty("redis_version", "unknown") : "unknown";
            return new SystemHealthResponse.RedisHealth(true, "redis_version=" + version);
        } catch (Exception e) {
            log.warn("Redis health check failed: {}", e.getMessage());
            return new SystemHealthResponse.RedisHealth(false, e.getMessage());
        }
    }

    private long uptimeSeconds() {
        return ManagementFactory.getRuntimeMXBean().getUptime() / 1000;
    }
}
