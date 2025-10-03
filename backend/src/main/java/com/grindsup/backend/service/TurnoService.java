package com.grindsup.backend.service;

import com.grindsup.backend.DTO.TurnoRequestDTO;
import com.grindsup.backend.DTO.TurnoResponseDTO;
import com.grindsup.backend.model.Entrenador;
import com.grindsup.backend.model.TipoTurno;
import com.grindsup.backend.model.Turno;
import com.grindsup.backend.repository.EntrenadorRepository;
import com.grindsup.backend.repository.TipoTurnoRepository;
import com.grindsup.backend.repository.TurnoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TurnoService {

    private final TurnoRepository turnoRepository;
    private final EntrenadorRepository entrenadorRepository;
    private final TipoTurnoRepository tipoTurnoRepository;
    private final GoogleCalendarNotificationService calendarNotificationService;

    @Autowired
    public TurnoService(TurnoRepository turnoRepository,
                        EntrenadorRepository entrenadorRepository,
                        TipoTurnoRepository tipoTurnoRepository,
                        GoogleCalendarNotificationService calendarNotificationService) {
        this.turnoRepository = turnoRepository;
        this.entrenadorRepository = entrenadorRepository;
        this.tipoTurnoRepository = tipoTurnoRepository;
        this.calendarNotificationService = calendarNotificationService;
    }

    public Turno crearTurno(Turno turno, String userId) throws Exception {
        Turno nuevoTurno = turnoRepository.save(turno);

        calendarNotificationService.createEvent(
                userId,
                "Turno con " + turno.getEntrenador().getUsuario().getNombre(),
                turno.getTipoTurno().getNombre(),
                turno.getFecha().toZonedDateTime(),
                turno.getFecha().plusHours(1).toZonedDateTime()
        );

        return nuevoTurno;
    }

    public TurnoResponseDTO mapToResponseDTO(Turno turno) {
        return new TurnoResponseDTO(
                turno.getId_turno(),
                turno.getEntrenador().getUsuario().getNombre(),
                turno.getTipoTurno().getNombre(),
                turno.getFecha()
        );
    }

    public Turno mapFromDTO(TurnoRequestDTO dto) {
        Turno turno = new Turno();

        // Buscar entrenador en DB
        Entrenador entrenador = entrenadorRepository.findById(dto.getEntrenadorId())
                .orElseThrow(() -> new RuntimeException("Entrenador no encontrado"));

        // Buscar tipoTurno en DB
        TipoTurno tipoTurno = tipoTurnoRepository.findByNombre(dto.getTipoTurno())
                .orElseThrow(() -> new RuntimeException("Tipo de turno no encontrado"));

        turno.setEntrenador(entrenador);
        turno.setTipoTurno(tipoTurno);
        turno.setFecha(dto.getFecha());

        return turno;
    }
}