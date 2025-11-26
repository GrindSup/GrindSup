package com.grindsup.backend.service;

import com.grindsup.backend.model.Entrenador;
import com.grindsup.backend.model.Notificacion;
import com.grindsup.backend.repository.NotificacionRepository;

import jakarta.transaction.Transactional;

import com.grindsup.backend.repository.EntrenadorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final EntrenadorRepository entrenadorRepository;

    public NotificacionService(NotificacionRepository notificacionRepository,
            EntrenadorRepository entrenadorRepository) {
        this.notificacionRepository = notificacionRepository;
        this.entrenadorRepository = entrenadorRepository;
    }

    // ✔️ Crear una notificación SOLO para entrenador
    public Notificacion crearNotificacionParaEntrenador(String titulo, String mensaje, Entrenador entrenador,
            Long idReferencia, String tipoReferencia) {
        Notificacion noti = new Notificacion();
        noti.setTitulo(titulo);
        noti.setMensaje(mensaje);
        noti.setEntrenador(entrenador);
        noti.setIdReferencia(idReferencia); // Nuevo campo
        noti.setTipoReferencia(tipoReferencia); // Nuevo campo
        return notificacionRepository.save(noti);
    }

    // ✔️ Obtener NOTIFICACIONES NO LEÍDAS del entrenador
    public List<Notificacion> obtenerNotificacionesEntrenador(Long entrenadorId) {
        Entrenador entrenador = entrenadorRepository.findById(entrenadorId)
                .orElseThrow(() -> new RuntimeException("Entrenador no encontrado con ID: " + entrenadorId));
        return notificacionRepository.findByEntrenadorAndLeidaFalseOrderByCreatedAtDesc(entrenador);
    }

    // ✔️ Obtener TODAS las notificaciones (opcional pero útil)
    public List<Notificacion> obtenerTodasNotificacionesEntrenador(Long entrenadorId) {
        Entrenador entrenador = entrenadorRepository.findById(entrenadorId)
                .orElseThrow(() -> new RuntimeException("Entrenador no encontrado con ID: " + entrenadorId));
        return notificacionRepository.findByEntrenadorOrderByCreatedAtDesc(entrenador);
    }

    // 🆕 NUEVO: Marcar TODAS como leídas para un entrenador
    @Transactional
    public int marcarTodasComoLeidas(Long entrenadorId) {
        Entrenador entrenador = entrenadorRepository.findById(entrenadorId)
                .orElseThrow(() -> new RuntimeException("Entrenador no encontrado con ID: " + entrenadorId));

        // Llama al nuevo método del repositorio
        return notificacionRepository.marcarTodasComoLeidas(entrenador);
    }

    // ✔️ Marcar como leída
    public void marcarComoLeida(Long id) {
        Notificacion n = notificacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notificación no encontrada"));
        n.setLeida(true);
        notificacionRepository.save(n);
    }
}