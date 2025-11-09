package com.grindsup.backend.service;

import com.grindsup.backend.DTO.AlumnoMinDTO;
import com.grindsup.backend.DTO.TurnoRequestDTO;
import com.grindsup.backend.DTO.TurnoResponseDTO;
import com.grindsup.backend.model.Alumno;
import com.grindsup.backend.model.Turno;
import com.grindsup.backend.repository.AlumnoRepository;
import com.grindsup.backend.repository.EntrenadorRepository;
import com.grindsup.backend.repository.EstadoRepository;
import com.grindsup.backend.repository.TipoTurnoRepository;
import com.grindsup.backend.repository.TurnoRepository;

import jakarta.transaction.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TurnoService {

    @Autowired
    private TurnoRepository turnoRepository;

    @Autowired
    private EntrenadorRepository entrenadorRepository;

    @Autowired
    private TipoTurnoRepository tipoTurnoRepository;

    @Autowired
    private EstadoRepository estadoRepository;

    @Autowired
    private AlumnoRepository alumnoRepository;

    @Autowired
    private GoogleCalendarNotificationService googleCalendarNotificationService;

    @Autowired
    private GoogleCalendarService googleCalendarService;

    // ======== NUEVO: listar por entrenador + filtros ========
    public List<TurnoResponseDTO> listarPorEntrenador(Long entrenadorId,
                                                      OffsetDateTime desde,
                                                      OffsetDateTime hasta,
                                                      String tipo)  {

        var turnos = turnoRepository.findByEntrenadorAndFilters(entrenadorId, desde, hasta, tipo);
        return turnos.stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }
    // ========================================================

    // ======== NUEVO: alumnos (con id) de un turno ========
    public List<AlumnoMinDTO> alumnosMinDeTurno(Long turnoId) {
        Turno turno = turnoRepository.findById(turnoId)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado"));

        if (turno.getAlumnos() == null)
            return List.of();

        return turno.getAlumnos().stream()
                .map(a -> new AlumnoMinDTO(a.getId_alumno(), a.getNombre(), a.getApellido()))
                .collect(Collectors.toList());
    }
    // ======================================================

    @Transactional
    public TurnoResponseDTO crearTurno(TurnoRequestDTO dto, String userId) throws Exception {
        Turno turno = new Turno();

        turno.setEntrenador(entrenadorRepository.findById(dto.getEntrenadorId())
                .orElseThrow(() -> new RuntimeException("Entrenador no encontrado")));

        turno.setTipoTurno(tipoTurnoRepository.findById(dto.getTipoTurnoId())
                .orElseThrow(() -> new RuntimeException("Tipo de turno no encontrado")));

        turno.setFecha(dto.getFecha());

        if (dto.getEstadoId() != null) {
            turno.setEstado(estadoRepository.findById(dto.getEstadoId())
                    .orElseThrow(() -> new RuntimeException("Estado no encontrado")));
        }

        turno.setAlumnos(new ArrayList<>());
        turno.setCreated_at(OffsetDateTime.now());
        turno.setUpdated_at(OffsetDateTime.now());

        Turno turnoGuardado = turnoRepository.save(turno);

        var start = turnoGuardado.getFecha().toZonedDateTime();
        var end = turnoGuardado.getFecha().plusHours(1).toZonedDateTime();

        String title = "Turno disponible - "
                + (turnoGuardado.getTipoTurno() != null ? turnoGuardado.getTipoTurno().getNombre() : "Turno");
        String description = "Turno vacío, aún sin alumnos asignados.";

        try {
            var event = googleCalendarNotificationService.createEvent(
                    userId, title, description, start, end);
            turnoGuardado.setGoogleEventId(event.getId());
            turnoRepository.save(turnoGuardado);
        } catch (Exception e) {
            System.err.println("⚠️ Error al crear evento en Google Calendar: " + e.getMessage());
        }

        return mapToResponseDTO(turnoGuardado);
    }

    public TurnoResponseDTO asignarAlumnos(Long turnoId, List<Long> alumnosIds) {
        Turno turno = turnoRepository.findById(turnoId)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado"));

        List<Alumno> alumnos = alumnoRepository.findAllById(alumnosIds);
        turno.getAlumnos().addAll(alumnos);
        turno.setUpdated_at(OffsetDateTime.now());

        turnoRepository.save(turno);
        return mapToResponseDTO(turno);
    }

    public List<TurnoResponseDTO> getAllTurnos() {
        return turnoRepository.findAllWithEntrenadorAndTipoTurno()
                .stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    public TurnoResponseDTO getTurnoById(Long id) {
        return turnoRepository.findById(id)
                .map(this::mapToResponseDTO)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado"));
    }

    public void deleteTurno(Long id) {
        if (!turnoRepository.existsById(id)) {
            throw new RuntimeException("Turno no encontrado");
        }
        turnoRepository.deleteById(id);
    }

    // -------- mapper entidad -> DTO (null-safe, Java 11) --------
    public TurnoResponseDTO mapToResponseDTO(Turno turno) {
        String entrenadorNombre = null;
        if (turno.getEntrenador() != null && turno.getEntrenador().getUsuario() != null) {
            entrenadorNombre = turno.getEntrenador().getUsuario().getNombre();
        }

        String tipoNombre = (turno.getTipoTurno() != null) ? turno.getTipoTurno().getNombre() : null;

        List<String> alumnosNombres = (turno.getAlumnos() != null)
                ? turno.getAlumnos().stream().map(Alumno::getNombre).collect(Collectors.toList())
                : Collections.emptyList();

        return new TurnoResponseDTO(
                turno.getId_turno(),
                entrenadorNombre,
                tipoNombre,
                turno.getFecha(),
                alumnosNombres);
    }
    // ---------------------------------------------------------

    @Transactional
    public TurnoResponseDTO modificarTurno(Long idTurno, TurnoRequestDTO dto, String userId) throws Exception {
        Turno turnoOriginal = turnoRepository.findById(idTurno)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado"));

        turnoOriginal.setDeleted_at(OffsetDateTime.now());
        turnoRepository.save(turnoOriginal);

        Turno nuevoTurno = new Turno();
        nuevoTurno.setEntrenador(turnoOriginal.getEntrenador());
        nuevoTurno.setTipoTurno(turnoOriginal.getTipoTurno());
        nuevoTurno.setAlumnos(new ArrayList<>(turnoOriginal.getAlumnos()));
        nuevoTurno.setFecha(dto.getFecha() != null ? dto.getFecha() : turnoOriginal.getFecha());
        nuevoTurno.setEstado(turnoOriginal.getEstado());
        nuevoTurno.setCreated_at(OffsetDateTime.now());
        nuevoTurno.setUpdated_at(OffsetDateTime.now());

        if (dto.getAlumnosIds() != null && !dto.getAlumnosIds().isEmpty()) {
            List<Alumno> alumnos = alumnoRepository.findAllById(dto.getAlumnosIds());
            nuevoTurno.setAlumnos(alumnos);
        }

        Turno turnoCreado = turnoRepository.save(nuevoTurno);

        var start = turnoCreado.getFecha().toZonedDateTime();
        var end = turnoCreado.getFecha().plusHours(1).toZonedDateTime();

        var newEvent = googleCalendarNotificationService.createEvent(
                userId,
                "Turno con " + (turnoCreado.getEntrenador() != null && turnoCreado.getEntrenador().getUsuario() != null
                        ? turnoCreado.getEntrenador().getUsuario().getNombre()
                        : "Entrenador"),
                turnoCreado.getTipoTurno() != null ? turnoCreado.getTipoTurno().getNombre() : "Turno",
                start,
                end);

        turnoCreado.setGoogleEventId(newEvent.getId());
        turnoRepository.save(turnoCreado);

        if (turnoOriginal.getGoogleEventId() != null) {
            try {
                googleCalendarService.deleteEvent(userId, "primary", turnoOriginal.getGoogleEventId());
            } catch (Exception e) {
                System.err.println("⚠️ No se pudo eliminar evento anterior de Google Calendar: " + e.getMessage());
            }
        }

        return mapToResponseDTO(turnoCreado);
    }

    @Transactional
    public void addAlumnoToTurno(Long turnoId, Long alumnoId) {
        Turno turno = turnoRepository.findById(turnoId)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado"));
        Alumno alumno = alumnoRepository.findById(alumnoId)
                .orElseThrow(() -> new RuntimeException("Alumno no encontrado"));

        turno.getAlumnos().add(alumno);
        turnoRepository.save(turno);
    }

    @Transactional
    public void removeAlumnoFromTurno(Long turnoId, Long alumnoId) {
        Turno turno = turnoRepository.findById(turnoId)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado"));
        Alumno alumno = alumnoRepository.findById(alumnoId)
                .orElseThrow(() -> new RuntimeException("Alumno no encontrado"));

        turno.getAlumnos().remove(alumno);
        turnoRepository.save(turno);
    }
}
