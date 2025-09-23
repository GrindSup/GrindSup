package com.grindsup.backend.controller;

import com.grindsup.backend.model.Alumno;
import com.grindsup.backend.model.Estado;
import com.grindsup.backend.repository.AlumnoRepository;
import com.grindsup.backend.repository.EstadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alumnos")
public class AlumnoController {

    @Autowired
    private AlumnoRepository alumnoRepository;

    @Autowired
    private EstadoRepository estadoRepository;

    // 🚩 Solo activos
    @GetMapping
    public List<Alumno> getAll() {
        return alumnoRepository.findByDeletedAtIsNull();
    }

    @GetMapping("/{id}")
    public Alumno getById(@PathVariable Long id) {
        return alumnoRepository.findById(id).orElse(null);
    }

    // 🚩 Solo eliminados
    @GetMapping("/eliminados")
    public List<Alumno> getEliminados() {
        return alumnoRepository.findByDeletedAtIsNotNull();
    }

    @PostMapping
    public Alumno create(@RequestBody Alumno alumno) {
        Estado estadoActivo = estadoRepository.findById(1L).orElse(null);
        alumno.setEstado(estadoActivo);
        alumno.setEntrenador(null);

        OffsetDateTime ahora = OffsetDateTime.now();
        alumno.setCreated_at(ahora);
        alumno.setUpdated_at(ahora);

        if (alumno.getNombre() != null) alumno.setNombre(alumno.getNombre().trim());
        if (alumno.getApellido() != null) alumno.setApellido(alumno.getApellido().trim());
        if (alumno.getDocumento() != null) alumno.setDocumento(alumno.getDocumento().trim());
        if (alumno.getTelefono() != null) alumno.setTelefono(alumno.getTelefono().trim());

        try {
            return alumnoRepository.save(alumno);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "No se pudo crear el alumno (verificá si el documento ya existe).",
                ex
            );
        }
    }

    @PutMapping("/{id}")
    public Alumno update(@PathVariable Long id, @RequestBody Alumno alumno) {
        return alumnoRepository.findById(id).map(existing -> {
            existing.setNombre(alumno.getNombre());
            existing.setApellido(alumno.getApellido());
            existing.setDocumento(alumno.getDocumento());
            existing.setTelefono(alumno.getTelefono());
            existing.setFechaNacimiento(alumno.getFechaNacimiento());
            existing.setPeso(alumno.getPeso());
            existing.setAltura(alumno.getAltura());
            existing.setLesiones(alumno.getLesiones());
            existing.setEnfermedades(alumno.getEnfermedades());
            existing.setInformeMedico(alumno.getInformeMedico());
            existing.setEntrenador(null);

            if (alumno.getEstado() != null) {
                Long estadoId = alumno.getEstado().getId_estado();
                if (estadoId != null) {
                    Estado nuevoEstado = estadoRepository.findById(estadoId).orElse(existing.getEstado());
                    existing.setEstado(nuevoEstado);
                }
            }

            existing.setUpdated_at(OffsetDateTime.now());

            try {
                return alumnoRepository.save(existing);
            } catch (DataIntegrityViolationException ex) {
                throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se pudo actualizar el alumno (verificá si el documento ya existe).",
                    ex
                );
            }
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alumno no encontrado"));
    }

    // 🚩 PATCH: actualizar solo el informe médico
    @PatchMapping("/{id}/informe")
    public Alumno updateInforme(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        return alumnoRepository.findById(id).map(existing -> {
            if (body.containsKey("informeMedico")) {
                existing.setInformeMedico(body.get("informeMedico"));
                existing.setUpdated_at(OffsetDateTime.now());
                return alumnoRepository.save(existing);
            } else {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Falta el campo informeMedico");
            }
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alumno no encontrado"));
    }

    // 🚩 Baja lógica
    @DeleteMapping("/{id}")
    public Alumno delete(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        return alumnoRepository.findById(id).map(alumno -> {
            if (body != null && body.containsKey("motivo")) {
                alumno.setMotivoBaja(body.get("motivo"));
            } else {
                alumno.setMotivoBaja("No especificado");
            }
            alumno.setDeletedAt(LocalDateTime.now());
            return alumnoRepository.save(alumno);
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alumno no encontrado"));
    }
}
