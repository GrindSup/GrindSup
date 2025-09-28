package com.grindsup.backend.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class UserService {

    // Simulación de base de datos en memoria
    private final Map<String, String> userRefreshTokens = new HashMap<>();
    private GoogleClientSecrets clientSecrets;

    /**
     * Devuelve el refresh token de un usuario por su ID.
     * 
     * @param userId ID del usuario
     * @return refresh token
     */
    public String getRefreshTokenForUser(String userId) {
        if (!userRefreshTokens.containsKey(userId)) {
            throw new RuntimeException("Usuario no encontrado o no tiene refresh token");
        }
        return userRefreshTokens.get(userId);
    }

    /**
     * Guarda o actualiza el refresh token de un usuario.
     * 
     * @param userId       ID del usuario
     * @param refreshToken refresh token de Google
     */
    public void setRefreshTokenForUser(String userId, String refreshToken) {
        userRefreshTokens.put(userId, refreshToken);
    }

    /**
     * Permite establecer los client secrets de Google dinámicamente si se desea.
     * 
     * @param clientSecrets objeto GoogleClientSecrets
     */
    public void setClientSecrets(GoogleClientSecrets clientSecrets) {
        this.clientSecrets = clientSecrets;
    }

    /**
     * Devuelve los client secrets configurados.
     * 
     * @return GoogleClientSecrets
     */
    public GoogleClientSecrets getClientSecrets() {
        if (clientSecrets == null) {
            throw new RuntimeException("Client secrets no configurados");
        }
        return clientSecrets;
    }
}
