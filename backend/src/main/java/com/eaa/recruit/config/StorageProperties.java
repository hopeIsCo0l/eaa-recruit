package com.eaa.recruit.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "storage")
public class StorageProperties {

    private String cvUploadDir = "./cv-uploads";

    public String getCvUploadDir() { return cvUploadDir; }
    public void setCvUploadDir(String cvUploadDir) { this.cvUploadDir = cvUploadDir; }
}
