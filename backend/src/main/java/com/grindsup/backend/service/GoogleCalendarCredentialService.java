package com.grindsup.backend.service;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential; 
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpTransport; // Importar HttpTransport
import com.google.api.client.json.JsonFactory; // Importar JsonFactory
import com.grindsup.backend.config.GoogleCalendarConfig;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;

@Service
// ELIMINAMOS @ConditionalOnProperty para forzar la creación del bean de credenciales.
public class GoogleCalendarCredentialService {

    private final GoogleCalendarConfig calendarConfig;
    private final UserService userService;

    public GoogleCalendarCredentialService(GoogleCalendarConfig calendarConfig, UserService userService) {
        this.calendarConfig = calendarConfig;
        this.userService = userService;
    }

    public Credential getCredentialForUser(String userId) throws Exception {
        // 1. Obtener refresh token del usuario desde la base de datos
        String refreshToken = userService.getRefreshTokenForUser(userId);

        if (refreshToken == null || refreshToken.isBlank()) {
            throw new IllegalStateException("El usuario " + userId + " no tiene Refresh Token guardado para Google Calendar.");
        }

        // Creamos Credential usando los métodos de la clase de configuración
        // Usamos el transporte y el factory que GoogleCalendarConfig expone.
        Credential credential = new GoogleCredential.Builder()
                .setTransport(GoogleNetHttpTransport.newTrustedTransport())
                .setJsonFactory(calendarConfig.getJsonFactory())
                .setClientSecrets(calendarConfig.getClientId(), calendarConfig.getClientSecret())
                .build()
                .setRefreshToken(refreshToken);

        // 2. Forzar el refresco si no hay Access Token o si está por expirar
        if (credential.getAccessToken() == null || (credential.getExpiresInSeconds() != null && credential.getExpiresInSeconds() <= 60)) {
            try {
                credential.refreshToken();
            } catch (IOException e) {
                System.err.println("Error al refrescar el token de Google para el usuario " + userId + ": " + e.getMessage());
                throw e; 
            }
        }
        
        return credential;
    }
}