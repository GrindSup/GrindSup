package com.grindsup.backend.service;

import com.grindsup.backend.model.PlanEntrenamiento;
import com.grindsup.backend.repository.PlanEntrenamientoRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class PlanEntrenamientoNotificationScheduler {

    private final PlanEntrenamientoRepository planEntrenamientoRepository;
    private final NotificacionService notificacionService;

    public PlanEntrenamientoNotificationScheduler(PlanEntrenamientoRepository planEntrenamientoRepository,
            NotificacionService notificacionService) {
        this.planEntrenamientoRepository = planEntrenamientoRepository;
        this.notificacionService = notificacionService;
    }

    // 🕒 Ejecutar diariamente a la 12:20 PM
    // Esto asegura que la verificación se hace una vez al día después de la
    // medianoche.
    @Scheduled(cron = "0 20 12 * * *")
    @Transactional
    public void notificarPlanesPorTerminarHoy() {

        LocalDate hoy = LocalDate.now();

        // 1. Obtener la lista de planes que terminan hoy y están pendientes.
        List<PlanEntrenamiento> planesPendientes = planEntrenamientoRepository
                .findPlanesTerminandoHoyYPendientesDeCalificar(hoy);

        for (PlanEntrenamiento plan : planesPendientes) {

            // 2. Crear el mensaje de notificación.
            String titulo = "Plan Vencido: Calificación Pendiente";

            // Asumo que tu entidad Alumno tiene getNombre() y getApellido()
            String mensaje = String.format(
                    "El plan de %s %s finalizó HOY. Recuerda calificarlo y crear el siguiente.",
                    plan.getAlumno().getNombre(),
                    plan.getAlumno().getApellido());

            // 3. Enviar la notificación al entrenador.
            notificacionService.crearNotificacionParaEntrenador(
                    titulo,
                    mensaje,
                    plan.getEntrenador(),
                    plan.getId_plan(),
                    "PLAN");
        }
    }
}