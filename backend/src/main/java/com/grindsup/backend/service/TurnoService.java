package com.grindsup.backend.service;

import com.grindsup.backend.dto.TurnoRequestDTO;
import com.grindsup.backend.dto.TurnoResponseDTO;
import com.grindsup.backend.model.Alumno;
import com.grindsup.backend.model.Turno;
import com.grindsup.backend.repository.AlumnoRepository;
import com.grindsup.backend.repository.EntrenadorRepository;
import com.grindsup.backend.repository.EstadoRepository;
import com.grindsup.backend.repository.TipoTurnoRepository;
import com.grindsup.backend.repository.TurnoRepository;

import java.time.OffsetDateTime;
import java.util.List;

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

    public TurnoResponseDTO crearTurno(TurnoRequestDTO dto) {
        Turno turno = new Turno();

        turno.setEntrenador(entrenadorRepository.findById(dto.getEntrenadorId())
                .orElseThrow(() -> new RuntimeException("Entrenador no encontrado")));

        turno.setTipoTurno(tipoTurnoRepository.findById(dto.getTipoTurnoId())
                .orElseThrow(() -> new RuntimeException("TipoTurno no encontrado")));

        turno.setFecha(dto.getFecha());

        if (dto.getEstadoId() != null) {
            turno.setEstado(estadoRepository.findById(dto.getEstadoId())
                    .orElseThrow(() -> new RuntimeException("Estado no encontrado")));
        }

        turno.setCreated_at(OffsetDateTime.now());
        turno.setUpdated_at(OffsetDateTime.now());

        turnoRepository.save(turno);
        return mapToResponseDTO(turno);
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
                turno.getAlumnos().stream().map(Alumno::getNombre).toList()
        );
    }
}