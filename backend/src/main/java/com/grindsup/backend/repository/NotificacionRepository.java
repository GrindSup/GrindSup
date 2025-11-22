package com.grindsup.backend.repository;

import com.grindsup.backend.model.Notificacion;
import com.grindsup.backend.model.Entrenador;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
    // ✔️ Único método válido: notificaciones del entrenador logueado
    List<Notificacion> findByEntrenadorAndLeidaFalseOrderByCreatedAtDesc(Entrenador entrenador);

    // ✔️ También te conviene agregar uno para traer TODAS (leídas + no leídas)
    List<Notificacion> findByEntrenadorOrderByCreatedAtDesc(Entrenador entrenador);
}