package com.grindsup.backend.controller;

import com.grindsup.backend.model.TurnoAlumno;
import com.grindsup.backend.model.TurnoAlumnoId;
import com.grindsup.backend.repository.TurnoAlumnoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/turno-alumno")
@CrossOrigin(origins = "*")
public class TurnoAlumnoController {

    @Autowired
    private TurnoAlumnoRepository turnoAlumnoRepository;

    // Obtener todos
    @GetMapping
    public List<TurnoAlumno> getAll() {
        return turnoAlumnoRepository.findAll();
    }

    // Obtener por ID compuesto
    @GetMapping("/{idTurno}/{idAlumno}")
    public Optional<TurnoAlumno> getById(@PathVariable Long idTurno, @PathVariable Long idAlumno) {
        TurnoAlumnoId id = new TurnoAlumnoId(idTurno, idAlumno);
        return turnoAlumnoRepository.findById(id);
    }

    // Crear nuevo registro
    @PostMapping
    public TurnoAlumno create(@RequestBody TurnoAlumno turnoAlumno) {
        return turnoAlumnoRepository.save(turnoAlumno);
    }

    // Eliminar
    @DeleteMapping("/{idTurno}/{idAlumno}")
    public void delete(@PathVariable Long idTurno, @PathVariable Long idAlumno) {
        TurnoAlumnoId id = new TurnoAlumnoId(idTurno, idAlumno);
        turnoAlumnoRepository.deleteById(id);
    }
}