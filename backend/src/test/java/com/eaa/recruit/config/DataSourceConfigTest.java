package com.eaa.recruit.config;

import com.zaxxer.hikari.HikariDataSource;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class DataSourceConfigTest {

    @Autowired
    DataSource dataSource;

    @Test
    void dataSourceIsHikari() {
        assertThat(dataSource).isInstanceOf(HikariDataSource.class);
    }

    @Test
    void hikariPoolSizesAreWithinBounds() {
        HikariDataSource hikari = (HikariDataSource) dataSource;
        assertThat(hikari.getMinimumIdle()).isGreaterThanOrEqualTo(1);
        assertThat(hikari.getMaximumPoolSize()).isGreaterThanOrEqualTo(hikari.getMinimumIdle());
    }

    @Test
    void jdbcConnectionRoundTrip() throws Exception {
        try (Connection conn = dataSource.getConnection();
             ResultSet rs = conn.createStatement().executeQuery("SELECT 1 AS probe")) {
            assertThat(rs.next()).isTrue();
            assertThat(rs.getInt("probe")).isEqualTo(1);
        }
    }
}
