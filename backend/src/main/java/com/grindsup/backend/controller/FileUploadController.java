// src/main/java/com/grindsup/backend/controller/FileUploadController.java
package com.grindsup.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*")
public class FileUploadController {

    @Value("${grindsup.upload-dir:uploads}")
    private String uploadDir;

    @PostMapping(value = "/foto-perfil", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> uploadFotoPerfil(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new RuntimeException("Archivo vacío");
        }

        // Crear carpeta si no existe
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Nombre único
        String original = file.getOriginalFilename();
        String ext = "";
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf('.'));
        }
        String filename = "perfil_" + UUID.randomUUID() + ext;

        Path dest = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);

        // URL pública (sirviendo /uploads/** como recurso estático)
        String publicUrl = "http://localhost:8080/uploads/" + filename;

        return Map.of("url", publicUrl);
    }
}
