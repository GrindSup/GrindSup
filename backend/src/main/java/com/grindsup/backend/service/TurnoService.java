package com.grindsup.backend.service;

import com.grindsup.backend.DTO.AlumnoMinDTO;
import com.grindsup.backend.DTO.TurnoRequestDTO;
import com.grindsup.backend.DTO.TurnoResponseDTO;
import com.grindsup.backend.model.Alumno;
import com.grindsup.backend.model.Turno;
import com.grindsup.backend.repository.AlumnoRepository;
import com.grindsup.backend.repository.EntrenadorRepository;
import com.grindsup.backend.repository.EstadoRepository;
import com.grindsup.backend.repository.TipoTurnoRepository;
import com.grindsup.backend.repository.TurnoRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

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

    @Transactional
    public TurnoResponseDTO crearTurno(TurnoRequestDTO dto) {
        Turno turno = new Turno();

        turno.setEntrenador(
                entrenadorRepository.findById(dto.getEntrenadorId())
                        .orElseThrow(() -> new RuntimeException("Entrenador no encontrado")));

        turno.setTipoTurno(
                tipoTurnoRepository.findById(dto.getTipoTurnoId())
                        .orElseThrow(() -> new RuntimeException("TipoTurno no encontrado")));

        turno.setFecha(dto.getFecha());

        if (dto.getEstadoId() != null) {
            turno.setEstado(
                    estadoRepository.findById(dto.getEstadoId())
                            .orElseThrow(() -> new RuntimeException("Estado no encontrado")));
        }

        turno.setCreated_at(OffsetDateTime.now());
        turno.setUpdated_at(OffsetDateTime.now());

        turnoRepository.save(turno);
        return mapToResponseDTO(turno);
    }

    /**
     * Agrega alumnos a un turno evitando duplicados.
     * Si el turno es individual, asegura que no quede con más de 1 alumno.
     */
    @Transactional
    public TurnoResponseDTO asignarAlumnos(Long turnoId, List<Long> alumnosIds) {
        Turno turno = turnoRepository.findById(turnoId)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado"));

        // IDs ya asignados
        Set<Long> yaAsignados = turno.getAlumnos().stream()
                .map(Alumno::getId_alumno)
                .collect(Collectors.toSet());

        // Solo agregar los que no estén ya en la lista
        List<Alumno> aAgregar = alumnoRepository.findAllById(alumnosIds).stream()
                .filter(a -> !yaAsignados.contains(a.getId_alumno()))
                .toList();

        // Regla de negocio: individual => máx. 1 alumno
        boolean esIndividual = turno.getTipoTurno() != null
                && "individual".equalsIgnoreCase(turno.getTipoTurno().getNombre());

        if (esIndividual && (turno.getAlumnos().size() + aAgregar.size()) > 1) {
            throw new IllegalArgumentException("Los turnos individuales solo admiten un alumno");
        }

        turno.getAlumnos().addAll(aAgregar);
        turno.setUpdated_at(OffsetDateTime.now());

        turnoRepository.save(turno);
        return mapToResponseDTO(turno);
    }

    /** Quita un alumno del turno (idempotente). */
    @Transactional
    public TurnoResponseDTO quitarAlumno(Long turnoId, Long alumnoId) {
        Turno turno = turnoRepository.findById(turnoId)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado"));

        turno.getAlumnos().removeIf(a -> a.getId_alumno().equals(alumnoId));
        turno.setUpdated_at(OffsetDateTime.now());

        turnoRepository.save(turno);
        return mapToResponseDTO(turno);
    }

    @Transactional(readOnly = true)
    public List<TurnoResponseDTO> getAllTurnos() {
        return turnoRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public TurnoResponseDTO getTurnoById(Long id) {
        return turnoRepository.findById(id)
                .map(this::mapToResponseDTO)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado"));
    }

    @Transactional
    public void deleteTurno(Long id) {
        if (!turnoRepository.existsById(id)) {
            throw new RuntimeException("Turno no encontrado");
        }
        turnoRepository.deleteById(id);
    }

    /** Actualiza fecha/hora del turno. */
    @Transactional
    public TurnoResponseDTO actualizarFecha(Long id, OffsetDateTime nuevaFecha) {
        Turno turno = turnoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado"));
        turno.setFecha(nuevaFecha);
        turno.setUpdated_at(OffsetDateTime.now());
        turnoRepository.save(turno);
        return mapToResponseDTO(turno);
    }

    private TurnoResponseDTO mapToResponseDTO(Turno turno) {
        return new TurnoResponseDTO(
                turno.getId_turno(),
                turno.getEntrenador().getUsuario().getNombre(),
                turno.getTipoTurno().getNombre(),
                turno.getFecha(),
                turno.getAlumnos().stream()
                        .map(a -> new AlumnoMinDTO(a.getId_alumno(), a.getNombre(), a.getApellido()))
                        .toList());
    }

}
