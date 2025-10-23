package com.grindsup.backend.controller;

import com.grindsup.backend.DTO.TurnoRequestDTO;
import com.grindsup.backend.DTO.TurnoResponseDTO;
import com.grindsup.backend.service.TurnoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin
@RestController
@RequestMapping("/api/turnos")
public class TurnoController {

    @Autowired
    private TurnoService turnoService;

    // Crear turno vacío (sin alumnos)
    // @PostMapping
    // public ResponseEntity<TurnoResponseDTO> createTurno(
    //         @RequestBody TurnoRequestDTO turnoDTO,
    //         @RequestParam String userId) throws Exception {

    //     return ResponseEntity.ok(turnoService.crearTurno(turnoDTO, userId));
    // }
    //Deberiamos usar userID para crear turnos o el ID de entrenador solamente?
    @PostMapping
    public ResponseEntity<TurnoResponseDTO> createTurno(@RequestBody TurnoRequestDTO turnoDTO) throws Exception {
        return ResponseEntity.ok(turnoService.crearTurno(turnoDTO, turnoDTO.getUserId()));
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

    // @CrossOrigin(origins = "*")
    // @GetMapping("/entrenador/{idEntrenador}")
    // public List<TurnoResponseDTO> getTurnosByEntrenador(@PathVariable Long idEntrenador) {
    //     return turnoService.getTurnosByEntrenador(idEntrenador);
    // }
    @GetMapping
    public List<TurnoResponseDTO> getTurnos(
        @RequestParam(required = false) Long entrenadorId,
        @RequestParam(required = false) String fecha,
        @RequestParam(required = false) Long tipoId) {

        return turnoService.filtrarTurnos(entrenadorId, fecha, tipoId);
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

    @PutMapping("/{id}/fecha")
    public ResponseEntity<TurnoResponseDTO> actualizarFecha(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(turnoService.actualizarFechaTurno(id, body));
    }
}
