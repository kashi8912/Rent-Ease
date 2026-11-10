package com.kaankaplan.road_bed.config.cloudinary;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.Set;

@Service
public class ImageUploadServiceImpl implements ImageUploadService {

    private static final Logger logger =
            LoggerFactory.getLogger(ImageUploadServiceImpl.class);

    private static final long MAX_FILE_SIZE =
            5L * 1024 * 1024;

    private static final Set<String> ALLOWED_CONTENT_TYPES =
            Set.of(
                    "image/jpeg",
                    "image/png",
                    "image/webp"
            );

    private final Cloudinary cloudinary;

    @Autowired
    public ImageUploadServiceImpl(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    @Override
    public Map uploadImage(MultipartFile multipartFile) {

        validateImage(multipartFile);

        Path temporaryFile = null;

        try {

            temporaryFile = Files.createTempFile(
                    "roadbed-upload-",
                    ".tmp"
            );

            try (InputStream inputStream =
                         multipartFile.getInputStream()) {

                Files.copy(
                        inputStream,
                        temporaryFile,
                        StandardCopyOption.REPLACE_EXISTING
                );
            }

            Map uploadResult = cloudinary.uploader().upload(
                    temporaryFile.toFile(),
                    ObjectUtils.asMap("resource_type", "image")
            );

            if (uploadResult == null ||
                    uploadResult.get("public_id") == null ||
                    uploadResult.get("url") == null) {

                throw new IllegalStateException(
                        "Cloudinary returned an invalid upload response."
                );
            }

            return uploadResult;

        } catch (IOException e) {

            throw new IllegalStateException(
                    "Unable to upload image. Please try again.",
                    e
            );

        } finally {

            if (temporaryFile != null) {

                try {
                    Files.deleteIfExists(temporaryFile);

                } catch (IOException e) {

                    logger.warn(
                            "Could not delete temporary upload file."
                    );
                }
            }
        }
    }

    private void validateImage(MultipartFile multipartFile) {

        if (multipartFile == null || multipartFile.isEmpty()) {
            throw new IllegalArgumentException(
                    "Image file cannot be empty."
            );
        }

        if (multipartFile.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    "Image size must not exceed 5 MB."
            );
        }

        String contentType = multipartFile.getContentType();

        if (contentType == null ||
                !ALLOWED_CONTENT_TYPES.contains(
                        contentType.toLowerCase()
                )) {

            throw new IllegalArgumentException(
                    "Only JPEG, PNG and WebP images are allowed."
            );
        }
    }

    @Override
    public Map deleteImage(String imageId) {

        if (imageId == null || imageId.isBlank()) {
            throw new IllegalArgumentException(
                    "Image ID cannot be empty."
            );
        }

        try {

            Map result = cloudinary.uploader().destroy(
                    imageId,
                    ObjectUtils.emptyMap()
            );

            if (result == null) {
                throw new IllegalStateException(
                        "Cloudinary returned an empty deletion response."
                );
            }

            return result;

        } catch (IOException e) {

            throw new IllegalStateException(
                    "Unable to delete image from Cloudinary.",
                    e
            );
        }
    }
}