package com.grindsup.backend.controller;

import com.grindsup.backend.DTO.TurnoRequestDTO;
import com.grindsup.backend.DTO.TurnoResponseDTO;
import com.grindsup.backend.service.TurnoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map; // <-- IMPORT NECESARIO

@RestController
@RequestMapping("/api/turnos")
@CrossOrigin
public class TurnoController {

    @Autowired
    private TurnoService turnoService;

    public ResponseEntity<TurnoResponseDTO> createTurno(@RequestBody TurnoRequestDTO turnoDTO) {
        return ResponseEntity.ok(turnoService.crearTurno(turnoDTO));
    }

    // Asignar alumnos (agrega a los existentes, no reemplaza)
    @PostMapping("/{turnoId}/alumnos")
    public ResponseEntity<TurnoResponseDTO> asignarAlumnos(
            @PathVariable Long turnoId,
            @RequestBody List<Long> alumnosIds) {
        return ResponseEntity.ok(turnoService.asignarAlumnos(turnoId, alumnosIds));

    }

    // Quitar 1 alumno
    @DeleteMapping("/{turnoId}/alumnos/{alumnoId}")
    public ResponseEntity<TurnoResponseDTO> quitarAlumno(
            @PathVariable Long turnoId,
            @PathVariable Long alumnoId) {
        return ResponseEntity.ok(turnoService.quitarAlumno(turnoId, alumnoId));
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

    // Actualizar fecha/hora
    @PutMapping("/{id}/fecha")
    public ResponseEntity<TurnoResponseDTO> actualizarFecha(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String iso = body.get("fecha");
        if (iso == null)
            throw new IllegalArgumentException("Falta 'fecha'");
        OffsetDateTime nueva = OffsetDateTime.parse(iso);
        return ResponseEntity.ok(turnoService.actualizarFecha(id, nueva));
    }
}
