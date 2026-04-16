package com.eaa.recruit.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "xai")
public class XaiProperties {

    private String reportsDir = "./xai-reports";

    public String getReportsDir() { return reportsDir; }
    public void setReportsDir(String reportsDir) { this.reportsDir = reportsDir; }
}
