package com.grindsup.backend.service;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.Events;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
public class GoogleCalendarService {

    private final GoogleCalendarCredentialService credentialService;
    private final Calendar.Builder calendarBuilder;

    public GoogleCalendarService(GoogleCalendarCredentialService credentialService) throws Exception {
        this.credentialService = credentialService;
        this.calendarBuilder = new Calendar.Builder(
                com.google.api.client.googleapis.javanet.GoogleNetHttpTransport.newTrustedTransport(),
                com.google.api.client.json.gson.GsonFactory.getDefaultInstance(),
                null)
                .setApplicationName("GrindSupBackend");
    }

    private Calendar getCalendar(String userId) throws Exception {
        Credential credential = credentialService.getCredentialForUser(userId);
        return calendarBuilder.setHttpRequestInitializer(credential).build();
    }

    public List<Event> getUpcomingEvents(String userId, String calendarId, int maxResults)
            throws IOException, Exception {
        Events events = getCalendar(userId).events().list(calendarId)
                .setMaxResults(maxResults)
                .setOrderBy("startTime")
                .setSingleEvents(true)
                .execute();
        return events.getItems();
    }

    public Event createEvent(String userId, String calendarId, Event event) throws IOException, Exception {
        return getCalendar(userId).events().insert(calendarId, event).execute();
    }

    public void deleteEvent(String userId, String calendarId, String eventId) throws IOException, Exception {
        getCalendar(userId).events().delete(calendarId, eventId).execute();
    }
}
