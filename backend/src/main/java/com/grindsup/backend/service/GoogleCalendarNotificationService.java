package com.grindsup.backend.service;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;
import com.grindsup.backend.config.GoogleCalendarConfig;
import org.springframework.stereotype.Service;

import java.util.TimeZone;

@Service
public class GoogleCalendarNotificationService {

    private final GoogleCalendarConfig calendarConfig;
    private final UserService userService;

    public GoogleCalendarNotificationService(GoogleCalendarConfig calendarConfig, UserService userService) {
        this.calendarConfig = calendarConfig;
        this.userService = userService;
    }

    /**
     * Crea un evento en Google Calendar usando el refresh token del usuario.
     *
     * @param userId      ID del usuario
     * @param title       Título del evento
     * @param description Descripción del evento
     * @param startTime   Inicio del evento (ZonedDateTime)
     * @param endTime     Fin del evento (ZonedDateTime)
     * @throws Exception si hay error al crear el evento
     */
    public Event createEvent(String userId, String title, String description, java.time.ZonedDateTime startTime,
            java.time.ZonedDateTime endTime) throws Exception {

        // 1. Obtener Credential desde flow y refresh token
        String refreshToken = userService.getRefreshTokenForUser(userId);
        Credential credential = calendarConfig.googleAuthorizationCodeFlow()
                .loadCredential(userId);

        if (credential == null) {
            throw new RuntimeException("No credential found for user " + userId);
        }

        // Si no tiene access token, forzar refresh usando refresh token
        if (credential.getAccessToken() == null
                || credential.getExpiresInSeconds() != null && credential.getExpiresInSeconds() <= 60) {
            credential.setRefreshToken(refreshToken);
            credential.refreshToken();
        }

        // 2. Crear Calendar service
        Calendar service = calendarConfig.buildCalendar(credential);

        // 3. Crear evento
        Event event = new Event();
        event.setSummary(title);
        event.setDescription(description);

        EventDateTime start = new EventDateTime()
                .setDateTime(new com.google.api.client.util.DateTime(startTime.toInstant().toEpochMilli()))
                .setTimeZone(TimeZone.getDefault().getID());

        EventDateTime end = new EventDateTime()
                .setDateTime(new com.google.api.client.util.DateTime(endTime.toInstant().toEpochMilli()))
                .setTimeZone(TimeZone.getDefault().getID());

        event.setStart(start);
        event.setEnd(end);

        // 4. Insertar evento en el calendario principal
        return service.events().insert("primary", event).execute();
    }
}
