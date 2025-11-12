package com.grindsup.backend.service;

import com.grindsup.backend.DTO.AlumnoMinDTO;
import com.grindsup.backend.DTO.TurnoRequestDTO;
import com.grindsup.backend.DTO.TurnoResponseDTO;
import com.grindsup.backend.model.Alumno;
import com.grindsup.backend.model.Turno;
import com.grindsup.backend.model.Usuario;
import com.grindsup.backend.repository.AlumnoRepository;
import com.grindsup.backend.repository.EntrenadorRepository;
import com.grindsup.backend.repository.EstadoRepository;
import com.grindsup.backend.repository.TipoTurnoRepository;
import com.grindsup.backend.repository.TurnoRepository;

import jakarta.transaction.Transactional;

import java.time.OffsetDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
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

    // 💡 Inyección opcional. Si Spring no puede crearlo (por configuración o falta de dependencia), será null.
    @Autowired(required = false)
    private GoogleCalendarNotificationService googleCalendarNotificationService;
    
    // ======== LISTAR: por entrenador + filtros ========
    public List<TurnoResponseDTO> listarPorEntrenador(Long entrenadorId,
                                                      OffsetDateTime desde,
                                                      OffsetDateTime hasta,
                                                      String tipo)  {

        var turnos = turnoRepository.findByEntrenadorAndFilters(entrenadorId, desde, hasta, tipo);
        return turnos.stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    // ======== OBTENER: alumnos (con id) de un turno ========
    public List<AlumnoMinDTO> alumnosMinDeTurno(Long turnoId) {
        Turno turno = turnoRepository.findById(turnoId)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado"));

        if (turno.getAlumnos() == null)
            return List.of();

        return turno.getAlumnos().stream()
                .map(a -> new AlumnoMinDTO(a.getId_alumno(), a.getNombre(), a.getApellido()))
                .collect(Collectors.toList());
    }

    // ======== CRUD: CREAR TURNO ========
    @Transactional
    public TurnoResponseDTO crearTurno(TurnoRequestDTO dto, String providedUserId) throws Exception {
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

        String resolvedUserId = resolveUserId(providedUserId, turnoGuardado); 

        // 💡 Bloque condicional: Solo intenta sincronizar si el servicio existe
        if (googleCalendarNotificationService != null) {
            ZonedDateTime start = turnoGuardado.getFecha().toZonedDateTime();
            ZonedDateTime end = turnoGuardado.getFecha().plusHours(1).toZonedDateTime();

            String title = buildEventSummary(turnoGuardado);
            String description = buildEventDescription(turnoGuardado);

            try {
                if (resolvedUserId != null) {
                    var event = googleCalendarNotificationService.createEvent(
                            resolvedUserId, title, description, start, end);
                    turnoGuardado.setGoogleEventId(event.getId());
                    turnoRepository.save(turnoGuardado);
                }
            } catch (Exception e) {
                // Registrar el error pero NO bloquear la creación del turno
                System.err.println("⚠️ Error al crear evento en Google Calendar: " + e.getMessage());
            }
        }

        return mapToResponseDTO(turnoGuardado);
    }

    // ======== CRUD: ASIGNAR ALUMNOS ========
    public TurnoResponseDTO asignarAlumnos(Long turnoId, List<Long> alumnosIds, String userId) {
        Turno turno = turnoRepository.findById(turnoId)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado"));

        List<Alumno> alumnos = alumnoRepository.findAllById(alumnosIds);
        turno.getAlumnos().addAll(alumnos);
        turno.setUpdated_at(OffsetDateTime.now());

        turnoRepository.save(turno);

        // Sincronizar evento de Google Calendar solo si el servicio existe
        if (googleCalendarNotificationService != null) {
            syncCalendarEvent(turno, userId);
        }
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

    // ======== CRUD: ELIMINAR TURNO ========
    public void deleteTurno(Long id, String userId) {
        Turno turno = turnoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado"));

        // Eliminar evento de Google Calendar solo si el servicio existe
        if (googleCalendarNotificationService != null) {
            deleteCalendarEvent(turno, userId);
        }
        turnoRepository.delete(turno);
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

    // ======== CRUD: MODIFICAR TURNO (Copia lógica de soft-delete) ========
    @Transactional
    public TurnoResponseDTO modificarTurno(Long idTurno, TurnoRequestDTO dto, String providedUserId) throws Exception {
        Turno turnoOriginal = turnoRepository.findById(idTurno)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado"));

        // 1. Soft-delete del turno original
        turnoOriginal.setDeleted_at(OffsetDateTime.now());
        turnoRepository.save(turnoOriginal);

        // 2. Crear nuevo turno
        Turno nuevoTurno = new Turno();
        nuevoTurno.setEntrenador(turnoOriginal.getEntrenador());
        nuevoTurno.setTipoTurno(turnoOriginal.getTipoTurno());
        nuevoTurno.setAlumnos(new ArrayList<>(turnoOriginal.getAlumnos())); 
        
        // Aplica cambios si vienen en el DTO
        nuevoTurno.setFecha(dto.getFecha() != null ? dto.getFecha() : turnoOriginal.getFecha());
        if (dto.getAlumnosIds() != null && !dto.getAlumnosIds().isEmpty()) {
            List<Alumno> alumnos = alumnoRepository.findAllById(dto.getAlumnosIds());
            nuevoTurno.setAlumnos(alumnos);
        }
        if (dto.getEstadoId() != null) {
             nuevoTurno.setEstado(estadoRepository.findById(dto.getEstadoId())
                     .orElseThrow(() -> new RuntimeException("Estado no encontrado")));
        } else {
             nuevoTurno.setEstado(turnoOriginal.getEstado());
        }

        nuevoTurno.setCreated_at(OffsetDateTime.now());
        nuevoTurno.setUpdated_at(OffsetDateTime.now());

        Turno turnoCreado = turnoRepository.save(nuevoTurno);

        // 3. Crear nuevo evento de Google Calendar y eliminar el original
        if (googleCalendarNotificationService != null) {
            String resolvedUserId = resolveUserId(providedUserId, turnoCreado);
            ZonedDateTime start = turnoCreado.getFecha().toZonedDateTime();
            ZonedDateTime end = turnoCreado.getFecha().plusHours(1).toZonedDateTime();

            try {
                if (resolvedUserId != null) {
                    var newEvent = googleCalendarNotificationService.createEvent(
                            resolvedUserId,
                            buildEventSummary(turnoCreado),
                            buildEventDescription(turnoCreado),
                            start,
                            end);

                    turnoCreado.setGoogleEventId(newEvent.getId());
                    turnoRepository.save(turnoCreado);
                }
            } catch (Exception e) {
                System.err.println("⚠️ Error al crear evento actualizado en Google Calendar: " + e.getMessage());
            }

            // 4. Eliminar evento de Google Calendar original
            if (turnoOriginal.getGoogleEventId() != null) {
                deleteCalendarEvent(turnoOriginal, resolvedUserId); // Reutilizamos la función de borrado
            }
        }

        return mapToResponseDTO(turnoCreado);
    }

    // ======== ADJUNTA ALUMNO (Con resolución de ID) ========
    @Transactional
    public void addAlumnoToTurno(Long turnoId, Long alumnoId, String userId) {
        Turno turno = turnoRepository.findById(turnoId)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado"));
        Alumno alumno = alumnoRepository.findById(alumnoId)
                .orElseThrow(() -> new RuntimeException("Alumno no encontrado"));

        turno.getAlumnos().add(alumno);
        turnoRepository.save(turno);

        // Sincronizar evento de Google Calendar solo si el servicio existe
        if (googleCalendarNotificationService != null) {
            syncCalendarEvent(turno, userId);
        }
    }

    // ======== REMOVER ALUMNO (Con resolución de ID) ========
    @Transactional
    public void removeAlumnoFromTurno(Long turnoId, Long alumnoId, String userId) {
        Turno turno = turnoRepository.findById(turnoId)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado"));
        Alumno alumno = alumnoRepository.findById(alumnoId)
                .orElseThrow(() -> new RuntimeException("Alumno no encontrado"));

        turno.getAlumnos().remove(alumno);
        turnoRepository.save(turno);

        // Sincronizar evento de Google Calendar solo si el servicio existe
        if (googleCalendarNotificationService != null) {
            syncCalendarEvent(turno, userId);
        }
    }

    // ======================================================
    // -------- MÉTODOS PRIVADOS DE CALENDARIZACIÓN Y UTILS --------
    // ======================================================

    private void syncCalendarEvent(Turno turno, String providedUserId) {
        if (turno == null || turno.getFecha() == null || turno.getGoogleEventId() == null) {
            return;
        }

        String resolvedUserId = resolveUserId(providedUserId, turno);
        if (resolvedUserId == null) {
            return;
        }

        ZonedDateTime start = turno.getFecha().toZonedDateTime();
        ZonedDateTime end = turno.getFecha().plusHours(1).toZonedDateTime();

        try {
            googleCalendarNotificationService.updateEvent(
                    resolvedUserId,
                    turno.getGoogleEventId(),
                    buildEventSummary(turno),
                    buildEventDescription(turno),
                    start,
                    end);
        } catch (Exception e) {
            System.err.println("⚠️ No se pudo actualizar el evento de Google Calendar: " + e.getMessage());
        }
    }

    private void deleteCalendarEvent(Turno turno, String providedUserId) {
        if (turno.getGoogleEventId() == null) {
            return;
        }

        String resolvedUserId = resolveUserId(providedUserId, turno);
        if (resolvedUserId == null) {
            return;
        }

        try {
            googleCalendarNotificationService.deleteEvent(resolvedUserId, turno.getGoogleEventId());
        } catch (Exception e) {
            System.err.println("⚠️ No se pudo eliminar el evento de Google Calendar: " + e.getMessage());
        }
    }

    private String buildEventSummary(Turno turno) {
        String tipo = (turno.getTipoTurno() != null) ? turno.getTipoTurno().getNombre() : "Turno";
        Usuario usuario = (turno.getEntrenador() != null) ? turno.getEntrenador().getUsuario() : null;
        String entrenadorNombre = (usuario != null && usuario.getNombre() != null)
                ? usuario.getNombre()
                : "Entrenador";
        return tipo + " con " + entrenadorNombre;
    }

    private String buildEventDescription(Turno turno) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm", Locale.getDefault());
        ZonedDateTime start = turno.getFecha().toZonedDateTime();
        StringBuilder description = new StringBuilder();
        description.append("Turno programado para el ")
                .append(start.format(formatter))
                .append(".");

        List<String> alumnos = (turno.getAlumnos() != null)
                ? turno.getAlumnos().stream().map(Alumno::getNombre).collect(Collectors.toList())
                : Collections.emptyList();

        if (alumnos.isEmpty()) {
            description.append("\nSin alumnos asignados todavía.");
        } else {
            description.append("\nAlumnos: ")
                    .append(String.join(", ", alumnos));
        }

        return description.toString();
    }

    /**
     * Intenta resolver el userId usando el ID provisto, o cae al ID del Usuario del Entrenador
     * asociado al Turno.
     */
    private String resolveUserId(String providedUserId, Turno turno) {
        // 1. Usar ID provisto (header/query param), si es válido
        if (providedUserId != null && !providedUserId.isBlank()) {
            // Se asume que el ID de usuario es numérico (Long).
            if (isNumeric(providedUserId)) {
                return providedUserId;
            }
            // Si no es numérico (ej: JWT ID string), se emite advertencia y se intenta la resolución automática.
            System.err.println("⚠️ userId provisto NO NUMÉRICO: " + providedUserId + ". Intentando resolver por turno.");
        }

        // 2. Usar ID del Entrenador del Turno
        if (turno != null
                && turno.getEntrenador() != null
                && turno.getEntrenador().getUsuario() != null
                && turno.getEntrenador().getUsuario().getId_usuario() != null) {
            return turno.getEntrenador().getUsuario().getId_usuario().toString();
        }

        return null;
    }

    private boolean isNumeric(String value) {
        return value != null && value.chars().allMatch(Character::isDigit);
    }
}