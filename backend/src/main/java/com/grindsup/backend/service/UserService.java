package com.grindsup.backend.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class UserService {

    // Simulación de base de datos en memoria (se borra al reiniciar)
    private final Map<String, String> userRefreshTokens = new HashMap<>();
    private GoogleClientSecrets clientSecrets; // Asumimos que se configura externamente

    /**
     * Devuelve el refresh token de un usuario por su ID.
     * ⚠️ Nota: Esta simulación en memoria se limpia al reiniciar el servidor.
     * * @param userId ID del usuario (debe coincidir con la clave de guardado, ej: "4")
     * @return refresh token o null si no existe.
     */
    public String getRefreshTokenForUser(String userId) {
        // Devuelve el token si existe, o null. Esto evita el crash.
        String token = userRefreshTokens.get(userId);
        if (token == null) {
            // Log para diagnóstico: si no encuentra la clave, es porque el Map está vacío o la clave no coincide.
            System.err.println("❌ ERROR AUTH: Refresh Token NO encontrado para userId: " + userId);
        }
        return token;
    }

    /**
     * Guarda o actualiza el refresh token de un usuario.
     * * @param userId ID del usuario (clave: ej. "4")
     * @param refreshToken refresh token de Google
     */
    public void setRefreshTokenForUser(String userId, String refreshToken) {
        userRefreshTokens.put(userId, refreshToken);
        System.out.println("✅ Refresh Token guardado para userId: " + userId.trim());
    }

    // El resto de los métodos se mantienen iguales (get/setClientSecrets)
    public void setClientSecrets(GoogleClientSecrets clientSecrets) {
        this.clientSecrets = clientSecrets;
    }

    public GoogleClientSecrets getClientSecrets() {
        if (clientSecrets == null) {
            throw new RuntimeException("Client secrets no configurados");
        }
        return clientSecrets;
    }
}