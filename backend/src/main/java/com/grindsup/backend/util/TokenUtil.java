package com.grindsup.backend.util;

import org.springframework.stereotype.Component;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

@Component
public class TokenUtil {

    private final SecureRandom sr = new SecureRandom();

    // Genera un token aleatorio seguro 
    public String generarTokenCrudo() {
        byte[] bytes = new byte[32]; // 256 bits
        sr.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    // Convierte un token en su hash SHA-256 en formato hexadecimal
    public String sha256Hex(String raw) {
        try {
            byte[] dig = MessageDigest.getInstance("SHA-256")
                    .digest(raw.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(64);
            for (byte b : dig) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new IllegalStateException("Error calculando SHA-256", e);
        }
    }
}
