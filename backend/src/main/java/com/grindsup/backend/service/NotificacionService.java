package com.grindsup.backend.service;

import com.grindsup.backend.model.Entrenador;
import com.grindsup.backend.model.Notificacion;
import com.grindsup.backend.repository.NotificacionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;

    public NotificacionService(NotificacionRepository notificacionRepository) {
        this.notificacionRepository = notificacionRepository;
    }

    // ✔️ Crear una notificación SOLO para entrenador
    public Notificacion crearNotificacionParaEntrenador(String titulo, String mensaje, Entrenador entrenador) {
        Notificacion noti = new Notificacion();
        noti.setTitulo(titulo);
        noti.setMensaje(mensaje);
        noti.setEntrenador(entrenador);
        return notificacionRepository.save(noti);
    }

    // ✔️ Obtener NOTIFICACIONES NO LEÍDAS del entrenador
    public List<Notificacion> obtenerNotificacionesEntrenador(Entrenador entrenador) {
        return notificacionRepository.findByEntrenadorAndLeidaFalseOrderByCreatedAtDesc(entrenador);
    }

    // ✔️ Obtener TODAS las notificaciones (opcional pero útil)
    public List<Notificacion> obtenerTodasNotificacionesEntrenador(Entrenador entrenador) {
        return notificacionRepository.findByEntrenadorOrderByCreatedAtDesc(entrenador);
    }

    // ✔️ Marcar como leída
    public void marcarComoLeida(Long id) {
        Notificacion n = notificacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notificación no encontrada"));
        n.setLeida(true);
        notificacionRepository.save(n);
    }
}