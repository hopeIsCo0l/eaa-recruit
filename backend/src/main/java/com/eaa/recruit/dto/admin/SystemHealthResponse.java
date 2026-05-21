package com.eaa.recruit.dto.admin;

public record SystemHealthResponse(
        DatabaseHealth database,
        RedisHealth redis,
        long uptimeSeconds
) {

    public record DatabaseHealth(boolean up, int activeConnections, int idleConnections) {}

    public record RedisHealth(boolean up, String info) {}
}
