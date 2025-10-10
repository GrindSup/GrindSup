package com.grindsup.backend.controller;

import com.grindsup.backend.DTO.TurnoRequestDTO;
import com.grindsup.backend.DTO.TurnoResponseDTO;
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

    public ResponseEntity<TurnoResponseDTO> createTurno(@RequestBody TurnoRequestDTO turnoDTO) {
        return ResponseEntity.ok(turnoService.crearTurno(turnoDTO));
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
}
