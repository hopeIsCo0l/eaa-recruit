package com.eaa.recruit.service;

import com.eaa.recruit.config.StorageProperties;
import com.eaa.recruit.exception.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);
    private static final long   MAX_SIZE_BYTES = 5 * 1024 * 1024L; // 5 MB
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private final Path uploadRoot;

    public FileStorageService(StorageProperties properties) {
        this.uploadRoot = Paths.get(properties.getCvUploadDir()).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadRoot);
        } catch (IOException e) {
            throw new IllegalStateException("Could not create CV upload directory: " + uploadRoot, e);
        }
    }

    /**
     * Validates and stores a CV file.
     *
     * @return storage path relative to upload root (e.g. "uuid.pdf")
     * @throws BusinessException if the file is invalid
     * @throws org.springframework.web.multipart.MaxUploadSizeExceededException propagates from Spring
     */
    public String storeCv(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("CV file must not be empty");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new BusinessException("CV file exceeds the 5 MB limit");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new BusinessException("CV must be a PDF or DOCX file");
        }

        String original  = file.getOriginalFilename();
        String extension = (original != null && original.contains("."))
                ? original.substring(original.lastIndexOf('.'))
                : ".pdf";
        String filename  = UUID.randomUUID() + extension;
        Path   target    = uploadRoot.resolve(filename);

        try {
            Files.copy(file.getInputStream(), target);
            log.debug("Stored CV file='{}'", target);
            return filename;
        } catch (IOException e) {
            log.error("Failed to store CV file: {}", e.getMessage(), e);
            throw new BusinessException("Could not store CV file — please retry");
        }
    }
}
