package com.grindsup.backend.controller;

import com.grindsup.backend.DTO.AlumnoMinDTO;
import com.grindsup.backend.DTO.TurnoRequestDTO;
import com.grindsup.backend.DTO.TurnoResponseDTO;
import com.grindsup.backend.service.TurnoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;
import java.util.List;

@RestController
@RequestMapping("/api/turnos")
@CrossOrigin(origins = "*")
public class TurnoController {

    @Autowired
    private TurnoService turnoService;

    // ========= LISTA POR ENTRENADOR (con filtros opcionales) =========
    // Ej: /api/turnos/entrenador/3?desde=2025-10-01&hasta=2025-10-31&tipo=grupal
    @GetMapping("/entrenador/{entrenadorId}")
    public List<TurnoResponseDTO> listarPorEntrenador(
            @PathVariable Long entrenadorId,
            @RequestParam(required = false) String desde,
            @RequestParam(required = false) String hasta,
            @RequestParam(required = false) String tipo
    ) {
        OffsetDateTime d = parseStart(desde);
        OffsetDateTime h = parseEnd(hasta);
        String t = (tipo == null || tipo.isBlank() || "todos".equalsIgnoreCase(tipo)) ? null : tipo.trim();
        return turnoService.listarPorEntrenador(entrenadorId, d, h, t);
    }

    // ========= CRUD: CREAR TURNO =========
    @PostMapping
    public ResponseEntity<TurnoResponseDTO> createTurno(
            @RequestBody TurnoRequestDTO turnoDTO,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestParam(value = "userId", required = false) String userId) throws Exception {
        
        String resolvedUserId = resolveUserId(headerUserId, userId);
        return ResponseEntity.ok(turnoService.crearTurno(turnoDTO, resolvedUserId));
    }

    // ========= CRUD: ASIGNAR ALUMNOS EN TURNO =========
    @PostMapping("/{turnoId}/alumnos")
    public ResponseEntity<TurnoResponseDTO> asignarAlumnos(
            @PathVariable Long turnoId,
            @RequestBody List<Long> alumnosIds,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestParam(value = "userId", required = false) String userId) {
        
        String resolvedUserId = resolveUserId(headerUserId, userId);
        return ResponseEntity.ok(turnoService.asignarAlumnos(turnoId, alumnosIds, resolvedUserId));
    }

    @GetMapping
    public List<TurnoResponseDTO> getAll() {
        return turnoService.getAllTurnos();
    }

    @GetMapping("/{id}")
    public TurnoResponseDTO getById(@PathVariable Long id) {
        return turnoService.getTurnoById(id);
    }

    // ========= CRUD: ELIMINAR TURNO =========
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id,
                                        @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
                                        @RequestParam(value = "userId", required = false) String userId) {
        
        String resolvedUserId = resolveUserId(headerUserId, userId);
        turnoService.deleteTurno(id, resolvedUserId);
        return ResponseEntity.ok("Turno eliminado con id " + id);
    }

    // ========= CRUD: AÑADIR ALUMNO INDIVIDUAL =========
    @PostMapping("/{turnoId}/alumnos/{alumnoId}")
    public void addAlumno(@PathVariable Long turnoId,
                          @PathVariable Long alumnoId,
                          @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
                          @RequestParam(value = "userId", required = false) String userId) {
        
        String resolvedUserId = resolveUserId(headerUserId, userId);
        turnoService.addAlumnoToTurno(turnoId, alumnoId, resolvedUserId);
    }

    // ========= CRUD: ELIMINAR ALUMNO INDIVIDUAL =========
    @DeleteMapping("/{turnoId}/alumnos/{alumnoId}")
    public void removeAlumno(@PathVariable Long turnoId,
                             @PathVariable Long alumnoId,
                             @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
                             @RequestParam(value = "userId", required = false) String userId) {
        
        String resolvedUserId = resolveUserId(headerUserId, userId);
        turnoService.removeAlumnoFromTurno(turnoId, alumnoId, resolvedUserId);
    }

    // ========= CRUD: MODIFICAR TURNO =========
    @PutMapping("/{id}")
    public TurnoResponseDTO modificarTurno(@PathVariable Long id,
                                           @RequestBody TurnoRequestDTO turnoDTO,
                                           @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
                                           @RequestParam(value = "userId", required = false) String userId) throws Exception {
        
        String resolvedUserId = resolveUserId(headerUserId, userId);
        return turnoService.modificarTurno(id, turnoDTO, resolvedUserId);
    }

    // ========= ALUMNOS DEL TURNO (con id, para chips del front) =========
    @GetMapping("/{id}/alumnos")
    public List<AlumnoMinDTO> alumnosDelTurno(@PathVariable Long id) {
        return turnoService.alumnosMinDeTurno(id);
    }

    // ========================================================
    // -------- HELPERS FECHAS Y USER ID --------
    // ========================================================
    
    // Método para resolver el userId (prioriza Header sobre Query Param)
    private String resolveUserId(String headerUserId, String paramUserId) {
        if (headerUserId != null && !headerUserId.isBlank()) {
            return headerUserId;
        }
        if (paramUserId != null && !paramUserId.isBlank()) {
            return paramUserId;
        }
        return null;
    }


    private OffsetDateTime parseStart(String s) {
        if (s == null || s.isBlank()) return null;
        try { return OffsetDateTime.parse(s); }
        catch (DateTimeParseException ignore) {
            LocalDate d = LocalDate.parse(s); // yyyy-MM-dd
            return d.atStartOfDay().atOffset(ZoneOffset.UTC);
        }
    }

    private OffsetDateTime parseEnd(String s) {
        if (s == null || s.isBlank())
            return null;
        try {
            return OffsetDateTime.parse(s);
        } catch (DateTimeParseException ignore) {
            LocalDate d = LocalDate.parse(s);
            return d.plusDays(1).atStartOfDay().atOffset(ZoneOffset.UTC).minusNanos(1);
        }
    }
}