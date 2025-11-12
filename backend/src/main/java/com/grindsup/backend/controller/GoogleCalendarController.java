package com.grindsup.backend.controller;

import com.google.api.services.calendar.model.Event;
import com.grindsup.backend.service.GoogleCalendarService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@ConditionalOnBean(GoogleCalendarService.class)
@RequestMapping("/api/google-calendar")
public class GoogleCalendarController {

    private final GoogleCalendarService calendarService;

    public GoogleCalendarController(GoogleCalendarService calendarService) {
        this.calendarService = calendarService;
    }

    @GetMapping("/events")
    public List<Event> getUpcomingEvents(
            @RequestParam String userId,
            @RequestParam String calendarId,
            @RequestParam(defaultValue = "10") int maxResults) throws Exception {
        return calendarService.getUpcomingEvents(userId, calendarId, maxResults);
    }

    @PostMapping("/events")
    public Event createEvent(
            @RequestParam String userId,
            @RequestParam String calendarId,
            @RequestBody Event event) throws Exception {
        return calendarService.createEvent(userId, calendarId, event);
    }

    @DeleteMapping("/events/{eventId}")
    public void deleteEvent(
            @RequestParam String userId,
            @RequestParam String calendarId,
            @PathVariable String eventId) throws Exception {
        calendarService.deleteEvent(userId, calendarId, eventId);
    }
}
