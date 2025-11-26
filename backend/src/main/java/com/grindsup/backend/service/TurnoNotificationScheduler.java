package com.grindsup.backend.service;

import com.grindsup.backend.model.Turno;
import com.grindsup.backend.repository.TurnoRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
public class TurnoNotificationScheduler {

    private final TurnoRepository turnoRepository;
    private final NotificacionService notificacionService;

    private static final DateTimeFormatter HORA_FORMATTER = DateTimeFormatter.ofPattern("hh:mm a",
            new Locale("es", "AR"));

    private static final ZoneId ZONA_LOCAL = ZoneId.of("America/Argentina/Cordoba");

    public TurnoNotificationScheduler(TurnoRepository turnoRepository,
            NotificacionService notificacionService) {
        this.turnoRepository = turnoRepository;
        this.notificacionService = notificacionService;
    }

    // =================================================================
    // 1. NOTIFICACIÓN DE TURNOS PRÓXIMOS
    // =================================================================

    @Scheduled(fixedRate = 60000) // Se ejecuta cada minuto
    @Transactional
    public void enviarNotificacionesPrevias() {
        OffsetDateTime ahora = OffsetDateTime.now();
        // Buscar turnos que comiencen dentro de 1 hora y 1 minuto (rango de chequeo)
        OffsetDateTime dentroDeUnaHora = ahora.plusHours(1).plusSeconds(60);

        List<Turno> turnosProximos = turnoRepository.findByFechaBetweenAndNotificacionPreviaEnviadaFalse(ahora,
                dentroDeUnaHora);

        for (Turno turno : turnosProximos) {

            OffsetDateTime fechaTurno = turno.getFecha();
            // Traducción explícita a la hora de Córdoba
            OffsetDateTime fechaLocal = fechaTurno
                    .atZoneSameInstant(ZONA_LOCAL)
                    .toOffsetDateTime();

            // Formatear la hora del turno (ej: 09:30 AM)
            String horaTurno = fechaLocal.format(HORA_FORMATTER);
            String listaAlumnos = obtenerListaAlumnos(turno);

            String titulo = "Turno Próximo";
            String mensaje = String.format("Tienes un turno a las %s con %s.", horaTurno, listaAlumnos);

            // Crear notificación (asumiendo que id_turno y tipo son el nuevo formato)
            notificacionService.crearNotificacionParaEntrenador(
                    titulo,
                    mensaje,
                    turno.getEntrenador(),
                    turno.getId_turno(),
                    "TURNO");

            turno.setNotificacionPreviaEnviada(true);
            turnoRepository.save(turno);
        }
    }

    // =================================================================
    // 3. FUNCIÓN AUXILIAR
    // =================================================================

    private String obtenerListaAlumnos(Turno turno) {
        if (turno.getAlumnos() == null || turno.getAlumnos().isEmpty()) {
            return "sin alumnos";
        }
        return turno.getAlumnos()
                .stream()
                .map(a -> a.getNombre() + " " + a.getApellido())
                .reduce((a, b) -> a + ", " + b)
                .orElse("varios alumnos");
    }
}