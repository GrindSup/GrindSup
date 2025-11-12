package com.grindsup.backend.config;

import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.CalendarScopes;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty; // Aseguramos el import

import java.io.InputStreamReader;
import java.util.Collections;

@Configuration
@ConditionalOnProperty(prefix = "grindsup.calendar", name = "enabled", havingValue = "true") // Manteniendo la condición
public class GoogleCalendarConfig {

    private static final String APPLICATION_NAME = "GrindSupBackend";
    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();
    
    // 💡 INYECCIÓN DE VALORES NECESARIOS
    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;
    
    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String clientSecret;
    
    // 💡 MÉTODOS PÚBLICOS DE ACCESO para el CredentialService
    public String getClientId() { return clientId; }
    public String getClientSecret() { return clientSecret; }
    public JsonFactory getJsonFactory() { return JSON_FACTORY; }


    @Bean
    public GoogleAuthorizationCodeFlow googleAuthorizationCodeFlow() throws Exception {
        var stream = getClass().getClassLoader().getResourceAsStream("credentials.json");
        if (stream == null) {
            throw new IllegalStateException("No se encontró credentials.json para Google Calendar");
        }

        try (InputStreamReader reader = new InputStreamReader(stream)) {

            GoogleClientSecrets clientSecrets = GoogleClientSecrets.load(JSON_FACTORY, reader);
            
            // Usamos CALENDAR_EVENTS si necesitas CRUD (Crear, Leer, Actualizar, Borrar)
            // Esto garantiza que el Refresh Token tenga los permisos suficientes.
            return new GoogleAuthorizationCodeFlow.Builder(
                        GoogleNetHttpTransport.newTrustedTransport(),
                        JSON_FACTORY,
                        clientSecrets,
                        Collections.singleton(CalendarScopes.CALENDAR_EVENTS)) // Usar CALENDAR_EVENTS para CRUD
                        .setAccessType("offline") // NECESARIO para obtener Refresh Token
                        .build();
        }
    }

    public Calendar buildCalendar(com.google.api.client.auth.oauth2.Credential credential) throws Exception {
        return new Calendar.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                JSON_FACTORY,
                credential)
                .setApplicationName(APPLICATION_NAME)
                .build();
    }
}