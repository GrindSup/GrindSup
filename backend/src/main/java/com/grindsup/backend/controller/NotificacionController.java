package com.grindsup.backend.controller;

import com.grindsup.backend.model.Entrenador;
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
        Entrenador entrenador = new Entrenador();
        entrenador.setIdEntrenador(id);
        return notificacionService.obtenerNotificacionesEntrenador(entrenador);
    }

    // ✔️ Marcar una notificación como leída
    @PostMapping("/{id}/leer")
    public void marcarComoLeida(@PathVariable Long id) {
        notificacionService.marcarComoLeida(id);
    }
}