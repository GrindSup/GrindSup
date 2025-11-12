package com.grindsup.backend.service;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.Events;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
@ConditionalOnProperty(prefix = "grindsup.calendar", name = "enabled", havingValue = "true")
public class GoogleCalendarService {

    private final GoogleCalendarCredentialService credentialService;
    private final Calendar.Builder calendarBuilder;

    public GoogleCalendarService(GoogleCalendarCredentialService credentialService) throws Exception {
        this.credentialService = credentialService;
        // Inicializamos el builder aquí con el transporte y el factory.
        this.calendarBuilder = new Calendar.Builder(
                com.google.api.client.googleapis.javanet.GoogleNetHttpTransport.newTrustedTransport(),
                com.google.api.client.json.gson.GsonFactory.getDefaultInstance(),
                null) // El credential inicial es null, se setea en getCalendar
                .setApplicationName("GrindSupBackend");
    }

    /**
     * Obtiene una instancia de CalendarService autenticada para el userId dado.
     * El credentialService es responsable de manejar el token.
     */
    private Calendar getCalendar(String userId) throws Exception {
        Credential credential = credentialService.getCredentialForUser(userId);
        if (credential == null) {
            throw new RuntimeException("No se pudo obtener Credential para el usuario " + userId);
        }
        // Construimos la instancia final de Calendar con la Credential
        return calendarBuilder.setHttpRequestInitializer(credential).build();
    }

    /**
     * Obtiene eventos próximos del calendario.
     */
    public List<Event> getUpcomingEvents(String userId, String calendarId, int maxResults)
            throws IOException, Exception {
        Events events = getCalendar(userId).events().list(calendarId)
                .setMaxResults(maxResults)
                .setOrderBy("startTime")
                .setSingleEvents(true)
                .execute();
        return events.getItems();
    }

    /**
     * Crea un evento en el calendario.
     */
    public Event createEvent(String userId, String calendarId, Event event) throws IOException, Exception {
        return getCalendar(userId).events().insert(calendarId, event).execute();
    }

    /**
     * Elimina un evento del calendario.
     */
    public void deleteEvent(String userId, String calendarId, String eventId) throws IOException, Exception {
        getCalendar(userId).events().delete(calendarId, eventId).execute();
    }
}