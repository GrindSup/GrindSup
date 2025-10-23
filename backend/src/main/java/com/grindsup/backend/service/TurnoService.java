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

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

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

    @Transactional
    public TurnoResponseDTO crearTurno(TurnoRequestDTO dto, String userId) throws Exception {
        // 1️⃣ Crear el objeto Turno vacío
        Turno turno = new Turno();

        // Entrenador y tipo de turno obligatorios
        turno.setEntrenador(entrenadorRepository.findById(dto.getEntrenadorId())
                .orElseThrow(() -> new RuntimeException("Entrenador no encontrado")));

        turno.setTipoTurno(tipoTurnoRepository.findById(dto.getTipoTurnoId())
                .orElseThrow(() -> new RuntimeException("Tipo de turno no encontrado")));

        turno.setFecha(dto.getFecha());

        // Estado opcional
        if (dto.getEstadoId() != null) {
            turno.setEstado(estadoRepository.findById(dto.getEstadoId())
                    .orElseThrow(() -> new RuntimeException("Estado no encontrado")));
        }

        // Los turnos se crean sin alumnos
        turno.setAlumnos(new ArrayList<>());

        turno.setCreated_at(OffsetDateTime.now());
        turno.setUpdated_at(OffsetDateTime.now());

        // 2️⃣ Guardar turno en BD (aún sin evento)
        Turno turnoGuardado = turnoRepository.save(turno);

        // 3️⃣ Crear evento en Google Calendar
        var start = turnoGuardado.getFecha().toZonedDateTime();
        var end = turnoGuardado.getFecha().plusHours(1).toZonedDateTime();

        // Texto descriptivo básico
        String title = "Turno disponible - " + turnoGuardado.getTipoTurno().getNombre();
        String description = "Turno vacío, aún sin alumnos asignados.";

        try {
            var event = googleCalendarNotificationService.createEvent(
                    userId,
                    title,
                    description,
                    start,
                    end);

            // 4️⃣ Guardar ID del evento de Google Calendar
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
        return turnoRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    public TurnoResponseDTO getTurnoById(Long id) {
        return turnoRepository.findById(id)
                .map(this::mapToResponseDTO)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado"));
    }

    public List<TurnoResponseDTO> getTurnosByEntrenador(Long idEntrenador) {
    return turnoRepository.findByEntrenador_Id(idEntrenador)
            .stream()
            .map(this::mapToResponseDTO)
            .toList();
    }
    
    public void deleteTurno(Long id) {
        if (!turnoRepository.existsById(id)) {
            throw new RuntimeException("Turno no encontrado");
        }
        turnoRepository.deleteById(id);
    }

    public TurnoResponseDTO mapToResponseDTO(Turno turno) {
        return new TurnoResponseDTO(
                turno.getId_turno(),
                turno.getEntrenador().getUsuario().getNombre(),
                turno.getTipoTurno().getNombre(),
                turno.getFecha(),
                turno.getAlumnos().stream()
                    .map(a -> new AlumnoMinDTO(a.getId_alumno(), a.getNombre(), a.getApellido()))
                    .toList());
    }

    @Transactional
    public TurnoResponseDTO modificarTurno(Long idTurno, TurnoRequestDTO dto, String userId) throws Exception {
        // 1️⃣ Buscar turno original
        Turno turnoOriginal = turnoRepository.findById(idTurno)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado"));

        // 2️⃣ Marcar turno original como eliminado
        turnoOriginal.setDeleted_at(OffsetDateTime.now());
        turnoRepository.save(turnoOriginal);

        // 3️⃣ Crear nuevo turno
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

        // 4️⃣ Guardar nuevo turno
        Turno turnoCreado = turnoRepository.save(nuevoTurno);

        // 5️⃣ Crear evento en Google Calendar
        var start = turnoCreado.getFecha().toZonedDateTime();
        var end = turnoCreado.getFecha().plusHours(1).toZonedDateTime();

        var newEvent = googleCalendarNotificationService.createEvent(
                userId,
                "Turno con " + turnoCreado.getEntrenador().getUsuario().getNombre(),
                turnoCreado.getTipoTurno().getNombre(),
                start,
                end);

        turnoCreado.setGoogleEventId(newEvent.getId());
        turnoRepository.save(turnoCreado);

        // 6️⃣ Eliminar evento anterior del calendario (si existe)
        if (turnoOriginal.getGoogleEventId() != null) {
            try {
                googleCalendarService.deleteEvent(userId, "primary", turnoOriginal.getGoogleEventId());
            } catch (Exception e) {
                System.err.println("⚠️ No se pudo eliminar evento anterior de Google Calendar: " + e.getMessage());
            }
        }

        return mapToResponseDTO(turnoCreado);
    }

    public TurnoResponseDTO actualizarFechaTurno(Long idTurno, Map<String, String> body) {
        Turno turno = turnoRepository.findById(idTurno)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado"));

        String nuevaFechaStr = body.get("fecha");
        OffsetDateTime nuevaFecha = OffsetDateTime.parse(nuevaFechaStr); // formato ISO 8601

        turno.setFecha(nuevaFecha);
        turnoRepository.save(turno);

        return mapToResponseDTO(turno);
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

    public List<TurnoResponseDTO> filtrarTurnos(Long entrenadorId, String fecha, Long tipoId) {
    return turnoRepository.findAll().stream()
            .filter(t -> entrenadorId == null || t.getEntrenador().getId_entrenador().equals(entrenadorId))
            .filter(t -> fecha == null || t.getFecha().toLocalDate().toString().equals(fecha))
            .filter(t -> tipoId == null || t.getTipoTurno().getId_tipoturno().equals(tipoId))
            .map(this::mapToResponseDTO)
            .toList();
    }

}