package com.grindsup.backend.controller;

import com.grindsup.backend.model.Notificacion;
import com.grindsup.backend.service.NotificacionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notificaciones")
@CrossOrigin
public class NotificacionController {

    private final NotificacionService notificacionService;

    public NotificacionController(NotificacionService notificacionService) {
        this.notificacionService = notificacionService;
    }

    // ✔️ Obtener notificaciones del ENTRENADOR
    @GetMapping("/entrenador/{id}")
    public List<Notificacion> getNotificacionesEntrenador(@PathVariable Long id) {
        return notificacionService.obtenerNotificacionesEntrenador(id);
    }

    // 🆕 NUEVO: Obtener TODAS las notificaciones (para verificar creación)
    @GetMapping("/entrenador/{id}/todas")
    public List<Notificacion> getAllNotificacionesEntrenador(@PathVariable Long id) {
        return notificacionService.obtenerTodasNotificacionesEntrenador(id);
    }

    // 🆕 NUEVO: Marcar TODAS las notificaciones del entrenador como leídas (PUT)
    @PutMapping("/entrenador/{id}/leidas")
    public void marcarTodasComoLeidas(@PathVariable Long id) {
        // Se llama al nuevo servicio para actualizar las notificaciones
        notificacionService.marcarTodasComoLeidas(id);
    }

    // ✔️ Marcar una notificación como leída
    @PostMapping("/{id}/leer")
    public void marcarComoLeida(@PathVariable Long id) {
        notificacionService.marcarComoLeida(id);
    }
}