package com.grindsup.backend.controller;

import com.google.api.services.calendar.model.Event;
import com.grindsup.backend.service.GoogleCalendarNotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;

@RestController
@RequestMapping("/api/google-calendar/notifications")
public class GoogleCalendarNotificationController {

    private final GoogleCalendarNotificationService notificationService;

    public GoogleCalendarNotificationController(GoogleCalendarNotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping("/events")
    public ResponseEntity<Event> createEvent(
            @RequestParam String userId,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam ZonedDateTime startTime,
            @RequestParam ZonedDateTime endTime) throws Exception {

        Event event = notificationService.createEvent(userId, title, description, startTime, endTime);
        return ResponseEntity.ok(event);
    }
}
