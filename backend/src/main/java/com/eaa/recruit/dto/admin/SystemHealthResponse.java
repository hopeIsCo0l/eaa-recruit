package com.eaa.recruit.dto.admin;

public record SystemHealthResponse(
        DatabaseHealth database,
        RedisHealth redis,
        KafkaHealth kafka,
        long uptimeSeconds
) {

    public record DatabaseHealth(boolean up, int activeConnections, int idleConnections) {}

    public record RedisHealth(boolean up, String info) {}

    public record KafkaHealth(boolean up, String details) {}
}
