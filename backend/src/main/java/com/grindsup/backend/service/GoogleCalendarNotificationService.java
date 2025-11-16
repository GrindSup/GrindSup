package com.grindsup.backend.service;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;
import com.grindsup.backend.config.GoogleCalendarConfig;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;

/**
 * Servicio encargado de la creación, actualización y eliminación de eventos
 * en Google Calendar para la cuenta del entrenador.
 */
@Service
@ConditionalOnProperty(prefix = "grindsup.calendar", name = "enabled", havingValue = "true")
public class GoogleCalendarNotificationService {

    private final GoogleCalendarConfig calendarConfig;
    private final GoogleCalendarCredentialService credentialService;

    public GoogleCalendarNotificationService(
            GoogleCalendarConfig calendarConfig,
            GoogleCalendarCredentialService credentialService
    ) {
        this.calendarConfig = calendarConfig;
        this.credentialService = credentialService;
    }

    private Calendar buildServiceForUser(String userId) throws Exception {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("userId requerido para operar con Google Calendar");
        }

        Credential credential = credentialService.getCredentialForUser(userId);
        if (credential == null) {
            throw new RuntimeException("No credential found for user " + userId);
        }

        return calendarConfig.buildCalendar(credential);
    }

    /**
     * Construye un objeto Event para Google Calendar usando ZonedDateTime.
     * DateTime de Google requiere epochMillis + offset, y timezone separada.
     */
    private Event buildEvent(
            String title,
            String description,
            ZonedDateTime startTime,
            ZonedDateTime endTime
    ) {

        ZonedDateTime start = startTime != null ? startTime : ZonedDateTime.now();
        ZonedDateTime end   = endTime != null ? endTime : start.plusHours(1);

        String zoneId = start.getZone().getId();  // Ej: "America/Argentina/Buenos_Aires"

        EventDateTime startEvent = new EventDateTime()
                .setDateTime(new DateTime(start.toInstant().toEpochMilli(), 0))
                .setTimeZone(zoneId);

        EventDateTime endEvent = new EventDateTime()
                .setDateTime(new DateTime(end.toInstant().toEpochMilli(), 0))
                .setTimeZone(zoneId);

        Event event = new Event();
        event.setSummary(title);
        event.setDescription(description);
        event.setStart(startEvent);
        event.setEnd(endEvent);

        return event;
    }

    public Event createEvent(
            String userId,
            String title,
            String description,
            ZonedDateTime startTime,
            ZonedDateTime endTime
    ) throws Exception {

        Calendar service = buildServiceForUser(userId);
        Event event = buildEvent(title, description, startTime, endTime);
        return service.events().insert("primary", event).execute();
    }

    public Event updateEvent(
            String userId,
            String eventId,
            String title,
            String description,
            ZonedDateTime startTime,
            ZonedDateTime endTime
    ) throws Exception {

        Calendar service = buildServiceForUser(userId);
        Event event = buildEvent(title, description, startTime, endTime);
        return service.events().update("primary", eventId, event).execute();
    }

    public void deleteEvent(String userId, String eventId) throws Exception {
        Calendar service = buildServiceForUser(userId);
        service.events().delete("primary", eventId).execute();
    }
}
