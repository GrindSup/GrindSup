package com.grindsup.backend.service;

import com.grindsup.backend.model.Turno;
import com.grindsup.backend.repository.TurnoRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
public class TurnoNotificationScheduler {

    private final TurnoRepository turnoRepository;
    private final NotificacionService notificacionService;

    public TurnoNotificationScheduler(TurnoRepository turnoRepository,
            NotificacionService notificacionService) {
        this.turnoRepository = turnoRepository;
        this.notificacionService = notificacionService;
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void enviarNotificacionesPrevias() {
        OffsetDateTime ahora = OffsetDateTime.now();
        OffsetDateTime dentroDeUnaHora = ahora.plusHours(1).plusSeconds(1);

        List<Turno> turnosProximos = turnoRepository.findByFechaBetweenAndNotificacionPreviaEnviadaFalse(ahora,
                dentroDeUnaHora);

        for (Turno turno : turnosProximos) {

            // El entrenador SIEMPRE es el que recibe la notificación
            notificacionService.crearNotificacionParaEntrenador(
                    "Turno Próximo",
                    "Tienes un turno dentro de una hora con " + obtenerListaAlumnos(turno),
                    turno.getEntrenador());
            turno.setNotificacionPreviaEnviada(true);
            turnoRepository.save(turno);
        }
    }

    private String obtenerListaAlumnos(Turno turno) {
        if (turno.getAlumnos() == null || turno.getAlumnos().isEmpty()) {
            return "sin alumnos";
        }
        return turno.getAlumnos()
                .stream()
                .map(a -> a.getNombre() + " " + a.getApellido())
                .reduce((a, b) -> a + ", " + b)
                .orElse("sin alumnos");
    }
}