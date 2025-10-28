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

    // ========= CRUD =========
    @PostMapping
    public ResponseEntity<TurnoResponseDTO> createTurno(
            @RequestBody TurnoRequestDTO turnoDTO,
            @RequestParam String userId) throws Exception {
        return ResponseEntity.ok(turnoService.crearTurno(turnoDTO, userId));
    }

    @PostMapping("/{turnoId}/alumnos")
    public ResponseEntity<TurnoResponseDTO> asignarAlumnos(
            @PathVariable Long turnoId,
            @RequestBody List<Long> alumnosIds) {
        return ResponseEntity.ok(turnoService.asignarAlumnos(turnoId, alumnosIds));
    }

    @GetMapping
    public List<TurnoResponseDTO> getAll() {
        return turnoService.getAllTurnos();
    }

    @GetMapping("/{id}")
    public TurnoResponseDTO getById(@PathVariable Long id) {
        return turnoService.getTurnoById(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        turnoService.deleteTurno(id);
        return ResponseEntity.ok("Turno eliminado con id " + id);
    }

    @PostMapping("/{turnoId}/alumnos/{alumnoId}")
    public void addAlumno(@PathVariable Long turnoId, @PathVariable Long alumnoId) {
        turnoService.addAlumnoToTurno(turnoId, alumnoId);
    }

    @DeleteMapping("/{turnoId}/alumnos/{alumnoId}")
    public void removeAlumno(@PathVariable Long turnoId, @PathVariable Long alumnoId) {
        turnoService.removeAlumnoFromTurno(turnoId, alumnoId);
    }

    @PutMapping("/{id}")
    public TurnoResponseDTO modificarTurno(@PathVariable Long id,
                                           @RequestBody TurnoRequestDTO turnoDTO,
                                           @RequestParam String userId) throws Exception {
        return turnoService.modificarTurno(id, turnoDTO, userId);
    }

    // ========= ALUMNOS DEL TURNO (con id, para chips del front) =========
    @GetMapping("/{id}/alumnos")
    public List<AlumnoMinDTO> alumnosDelTurno(@PathVariable Long id) {
        return turnoService.alumnosMinDeTurno(id);
    }

    // ========= helpers fechas =========
    private OffsetDateTime parseStart(String s) {
        if (s == null || s.isBlank()) return null;
        try { return OffsetDateTime.parse(s); }
        catch (DateTimeParseException ignore) {
            LocalDate d = LocalDate.parse(s); // yyyy-MM-dd
            return d.atStartOfDay().atOffset(ZoneOffset.UTC);
        }
    }
    private OffsetDateTime parseEnd(String s) {
        if (s == null || s.isBlank()) return null;
        try { return OffsetDateTime.parse(s); }
        catch (DateTimeParseException ignore) {
            LocalDate d = LocalDate.parse(s);
            return d.plusDays(1).atStartOfDay().atOffset(ZoneOffset.UTC).minusNanos(1);
        }
    }
}
