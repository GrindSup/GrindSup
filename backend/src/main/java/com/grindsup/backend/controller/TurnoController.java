package com.grindsup.backend.controller;

import com.grindsup.backend.model.Turno;
import com.grindsup.backend.model.Entrenador;
import com.grindsup.backend.dto.TurnoRequestDTO;
import com.grindsup.backend.dto.TurnoResponseDTO;
import com.grindsup.backend.model.Alumno;
import com.grindsup.backend.model.TipoTurno;
import com.grindsup.backend.model.Estado;
import com.grindsup.backend.repository.TurnoRepository;
import com.grindsup.backend.service.TurnoService;
import com.grindsup.backend.repository.EntrenadorRepository;
import com.grindsup.backend.repository.AlumnoRepository;
import com.grindsup.backend.repository.TipoTurnoRepository;
import com.grindsup.backend.repository.EstadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/turnos")
public class TurnoController {

    @Autowired
    private TurnoRepository turnoRepository;

    @Autowired
    private EntrenadorRepository entrenadorRepository;

    @Autowired
    private AlumnoRepository alumnoRepository;

    @Autowired
    private TipoTurnoRepository tipoTurnoRepository;

    @Autowired
    private EstadoRepository estadoRepository;

    @Autowired
    private TurnoService turnoService;
    
    @GetMapping
    public List<Turno> getAll() {
        return turnoRepository.findAll();
    }

    @GetMapping("/{id}")
    public Turno getById(@PathVariable Long id) {
        return turnoRepository.findById(id).orElse(null);
    }

    // @PostMapping
    // public Turno create(@RequestBody Turno turno) {
    //     if (turno.getEntrenador() != null) {
    //         Entrenador entrenador = entrenadorRepository.findById(turno.getEntrenador().getId_entrenador())
    //                 .orElse(null);
    //         turno.setEntrenador(entrenador);
    //     }
    //     if (turno.getAlumno() != null) {
    //         Alumno alumno = alumnoRepository.findById(turno.getAlumno().getId_alumno()).orElse(null);
    //         turno.setAlumno(alumno);
    //     }
    //     if (turno.getTipoTurno() != null) {
    //         TipoTurno tipo = tipoTurnoRepository.findById(turno.getTipoTurno().getId_tipoturno()).orElse(null);
    //         turno.setTipoTurno(tipo);
    //     }
    //     if (turno.getEstado() != null) {
    //         Estado estado = estadoRepository.findById(turno.getEstado().getId_estado()).orElse(null);
    //         turno.setEstado(estado);
    //     }
    //     return turnoRepository.save(turno);
    // }
    @PostMapping
    public TurnoResponseDTO createTurno(@RequestBody TurnoRequestDTO turnoDTO,
                                    @RequestParam String userId) throws Exception {
        Turno turno = turnoService.mapFromDTO(turnoDTO);
        Turno nuevoTurno = turnoService.crearTurno(turno, userId);
        return turnoService.mapToResponseDTO(nuevoTurno);
    }

    @PutMapping("/{id}")
    public Turno update(@PathVariable Long id, @RequestBody Turno turno) {
        return turnoRepository.findById(id).map(existing -> {
            existing.setFecha(turno.getFecha());

            if (turno.getEntrenador() != null) {
                Entrenador entrenador = entrenadorRepository.findById(turno.getEntrenador().getId_entrenador())
                        .orElse(null);
                existing.setEntrenador(entrenador);
            }
            if (turno.getAlumno() != null) {
                Alumno alumno = alumnoRepository.findById(turno.getAlumno().getId_alumno()).orElse(null);
                existing.setAlumno(alumno);
            }
            if (turno.getTipoTurno() != null) {
                TipoTurno tipo = tipoTurnoRepository.findById(turno.getTipoTurno().getId_tipoturno()).orElse(null);
                existing.setTipoTurno(tipo);
            }
            if (turno.getEstado() != null) {
                Estado estado = estadoRepository.findById(turno.getEstado().getId_estado()).orElse(null);
                existing.setEstado(estado);
            }
            return turnoRepository.save(existing);
        }).orElse(null);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        turnoRepository.deleteById(id);
        return "Turno eliminado con id " + id;
    }
}
 