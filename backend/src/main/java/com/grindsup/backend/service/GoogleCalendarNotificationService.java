package com.grindsup.backend.service;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;
import com.grindsup.backend.config.GoogleCalendarConfig;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.TimeZone;
import java.time.ZonedDateTime; 

/**
 * Servicio encargado de la creación, actualización y eliminación de eventos 
 * en Google Calendar para la cuenta del entrenador.
 * Depende de GoogleCalendarCredentialService para obtener Credenciales.
 */
@Service
@ConditionalOnProperty(prefix = "grindsup.calendar", name = "enabled", havingValue = "true")
public class GoogleCalendarNotificationService {

    private final GoogleCalendarConfig calendarConfig;
    private final GoogleCalendarCredentialService credentialService;

    // Constructor para inyección de dependencia
    public GoogleCalendarNotificationService(
            GoogleCalendarConfig calendarConfig, 
            GoogleCalendarCredentialService credentialService) {
        this.calendarConfig = calendarConfig;
        this.credentialService = credentialService;
    }

    /**
     * Construye y devuelve el objeto Calendar Service para el usuario dado, 
     * delegando la obtención y el refresh de Credential.
     */
    private Calendar buildServiceForUser(String userId) throws Exception {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("userId requerido para operar con Google Calendar");
        }

        // 💡 Delegamos la obtención/refresco de Credential
        // Se asume que CredentialService maneja el refresh del token si es necesario
        Credential credential = credentialService.getCredentialForUser(userId); 

        if (credential == null) {
            throw new RuntimeException("No credential found for user " + userId);
        }

        // Construye el servicio de Calendar
        return calendarConfig.buildCalendar(credential);
    }

    private Event buildEvent(String title,
                             String description,
                             ZonedDateTime startTime,
                             ZonedDateTime endTime) {

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
        return event;
    }

    /**
     * Crea un evento en Google Calendar.
     */
    public Event createEvent(String userId,
                             String title,
                             String description,
                             ZonedDateTime startTime,
                             ZonedDateTime endTime) throws Exception {

        Calendar service = buildServiceForUser(userId);
        Event event = buildEvent(title, description, startTime, endTime);
        return service.events().insert("primary", event).execute();
    }

    /**
     * Actualiza un evento existente en Google Calendar.
     */
    public Event updateEvent(String userId,
                             String eventId,
                             String title,
                             String description,
                             ZonedDateTime startTime,
                             ZonedDateTime endTime) throws Exception {

        Calendar service = buildServiceForUser(userId);
        Event event = buildEvent(title, description, startTime, endTime);
        return service.events().update("primary", eventId, event).execute();
    }

    /**
     * Elimina un evento de Google Calendar.
     */
    public void deleteEvent(String userId, String eventId) throws Exception {
        Calendar service = buildServiceForUser(userId);
        service.events().delete("primary", eventId).execute();
    }
}