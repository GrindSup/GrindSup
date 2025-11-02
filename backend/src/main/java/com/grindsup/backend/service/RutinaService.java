// backend/src/main/java/com/grindsup/backend/service/RutinaService.java
package com.grindsup.backend.service;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.grindsup.backend.model.Estado;
import com.grindsup.backend.model.Rutina;
import com.grindsup.backend.model.RutinaEjercicio;
import com.grindsup.backend.repository.EstadoRepository;
import com.grindsup.backend.repository.RutinaEjercicioRepository;
import com.grindsup.backend.repository.RutinaRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class RutinaService {

    private final RutinaRepository rutinaRepository;
    private final RutinaEjercicioRepository rutinaEjercicioRepository;
    private final EstadoRepository estadoRepository;

    public RutinaService(RutinaRepository rutinaRepository,
                         RutinaEjercicioRepository rutinaEjercicioRepository,
                         EstadoRepository estadoRepository) {
        this.rutinaRepository = rutinaRepository;
        this.rutinaEjercicioRepository = rutinaEjercicioRepository;
        this.estadoRepository = estadoRepository;
    }

    /** Borrado lógico por ID de rutina. */
    @Transactional
    public void softDelete(Long idRutina) {
        Rutina r = rutinaRepository.findById(idRutina)
                .orElseThrow(() -> new IllegalArgumentException("Rutina no encontrada"));

        OffsetDateTime now = OffsetDateTime.now();
        r.setDeleted_at(now);
        rutinaRepository.save(r);

        // Marcamos ejercicios de la rutina como eliminados
        List<RutinaEjercicio> ejercicios = rutinaEjercicioRepository.findAllByRutinaId(idRutina);
        for (RutinaEjercicio re : ejercicios) {
            re.setDeleted_at(now);
        }
        rutinaEjercicioRepository.saveAll(ejercicios);
    }

    /** Borrado lógico validando que la rutina pertenezca al plan. */
    @Transactional
    public void softDeleteFromPlan(Long idPlan, Long idRutina) {
        Rutina r = rutinaRepository.findById(idRutina)
                .orElseThrow(() -> new IllegalArgumentException("Rutina no encontrada"));
        if (r.getPlan() == null || !r.getPlan().getId_plan().equals(idPlan)) {
            throw new IllegalArgumentException("La rutina no pertenece al plan indicado");
        }
        softDelete(idRutina);
    }

    @Transactional
    public void actualizarEstado(Long idRutina, Long idEstado) {
        // deberiamos asignar un valor por defecto en caso de no encontrar?
        Estado estado = estadoRepository.findById(idEstado)
        .orElseThrow(() -> new EntityNotFoundException("Estado no encontrado"));
        Rutina rutina = rutinaRepository.findById(idRutina)
            .orElseThrow(() -> new EntityNotFoundException("Rutina no encontrada"));
        rutina.setEstado(estado);
        rutina.setUpdated_at(OffsetDateTime.now());
        rutinaRepository.save(rutina);
    }
}
