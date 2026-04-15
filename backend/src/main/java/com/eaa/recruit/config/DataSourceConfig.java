package com.eaa.recruit.config;

import com.zaxxer.hikari.HikariDataSource;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    private final DataSource dataSource;

    public DataSourceConfig(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @PostConstruct
    public void logPoolConfig() {
        if (dataSource instanceof HikariDataSource hikari) {
            log.info("HikariCP pool '{}' initialised — min-idle={}, max-pool-size={}, connection-timeout={}ms",
                    hikari.getPoolName(),
                    hikari.getMinimumIdle(),
                    hikari.getMaximumPoolSize(),
                    hikari.getConnectionTimeout());
        }
    }
}
