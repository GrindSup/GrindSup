package com.grindsup.backend.controller;

import com.grindsup.backend.dto.TurnoRequestDTO;
import com.grindsup.backend.dto.TurnoResponseDTO;
import com.grindsup.backend.service.TurnoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/turnos")
public class TurnoController {

    @Autowired
    private TurnoService turnoService;

    // Crear turno vacío (sin alumnos)
    @PostMapping
    public ResponseEntity<TurnoResponseDTO> createTurno(
            @RequestBody TurnoRequestDTO turnoDTO,
            @RequestParam String userId) throws Exception {

        return ResponseEntity.ok(turnoService.crearTurno(turnoDTO, userId));
    }

    // Asignar alumnos a un turno existente
    @PostMapping("/{turnoId}/alumnos")
    public ResponseEntity<TurnoResponseDTO> asignarAlumnos(
            @PathVariable Long turnoId,
            @RequestBody List<Long> alumnosIds) {
        return ResponseEntity.ok(turnoService.asignarAlumnos(turnoId, alumnosIds));
    }

    // Obtener todos los turnos
    @GetMapping
    public List<TurnoResponseDTO> getAll() {
        return turnoService.getAllTurnos();
    }

    // Obtener turno por ID
    @GetMapping("/{id}")
    public TurnoResponseDTO getById(@PathVariable Long id) {
        return turnoService.getTurnoById(id);
    }

    // Eliminar turno
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        turnoService.deleteTurno(id);
        return ResponseEntity.ok("Turno eliminado con id " + id);
    }

    // modificar turno
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
}