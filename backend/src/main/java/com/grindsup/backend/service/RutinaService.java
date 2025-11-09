package com.grindsup.backend.service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.grindsup.backend.DTO.RutinaEjercicioRequestDTO;
import com.grindsup.backend.DTO.RutinaUpdateRequestDTO;
import com.grindsup.backend.model.Ejercicio;
import com.grindsup.backend.model.Rutina;
import com.grindsup.backend.model.RutinaEjercicio;
import com.grindsup.backend.repository.EjercicioRepository;
import com.grindsup.backend.repository.RutinaEjercicioRepository;
import com.grindsup.backend.repository.RutinaRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.PersistenceContext;

@Service
public class RutinaService {

    private final RutinaRepository rutinaRepository;
    private final RutinaEjercicioRepository rutinaEjercicioRepository;
    private final EjercicioRepository ejercicioRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public RutinaService(RutinaRepository rutinaRepository,
            RutinaEjercicioRepository rutinaEjercicioRepository,
            EjercicioRepository ejercicioRepository) {
        this.rutinaRepository = rutinaRepository;
        this.rutinaEjercicioRepository = rutinaEjercicioRepository;
        this.ejercicioRepository = ejercicioRepository;
    }

    @Transactional
    public Rutina update(Long idRutina, RutinaUpdateRequestDTO dto) {

        Rutina rutina = rutinaRepository.findById(idRutina)
                .orElseThrow(() -> new EntityNotFoundException("Rutina no encontrada con id: " + idRutina));

        rutina.setNombre(dto.getNombre());
        rutina.setDescripcion(dto.getDescripcion());

        rutinaEjercicioRepository.deleteAllByRutinaId(idRutina);

        entityManager.flush();
        entityManager.clear();

        Rutina rutinaRef = rutinaRepository.findById(idRutina)
                .orElseThrow(() -> new EntityNotFoundException("Rutina no encontrada post-clear: " + idRutina));

        List<RutinaEjercicio> nuevosEjercicios = new ArrayList<>();

        if (dto.getEjercicios() != null) {
            for (RutinaEjercicioRequestDTO ejDto : dto.getEjercicios()) {

                Ejercicio ejercicio = ejercicioRepository.findById(ejDto.getIdEjercicio())
                        .orElseThrow(() -> new EntityNotFoundException(
                                "Ejercicio no encontrado con id: " + ejDto.getIdEjercicio()));

                RutinaEjercicio nuevoItem = new RutinaEjercicio();

                nuevoItem.setRutina(rutinaRef);
                nuevoItem.setEjercicio(ejercicio);
                nuevoItem.setSeries(ejDto.getSeries());
                nuevoItem.setRepeticiones(ejDto.getRepeticiones());
                nuevoItem.setGrupo_muscular(ejDto.getGrupoMuscular());
                nuevoItem.setObservaciones(ejDto.getGrupoMuscular());

                nuevosEjercicios.add(nuevoItem);
            }
        }

        rutinaEjercicioRepository.saveAll(nuevosEjercicios);

        return rutinaRef;
    }

    @Transactional
    public void softDelete(Long idRutina) {
        Rutina r = rutinaRepository.findById(idRutina)
                .orElseThrow(() -> new IllegalArgumentException("Rutina no encontrada"));

        OffsetDateTime now = OffsetDateTime.now();
        r.setDeleted_at(now);
        rutinaRepository.save(r);

        List<RutinaEjercicio> ejercicios = rutinaEjercicioRepository.findAllByRutinaId(idRutina);
        for (RutinaEjercicio re : ejercicios) {
            re.setDeleted_at(now);
        }
        rutinaEjercicioRepository.saveAll(ejercicios);
    }

    @Transactional
    public void softDeleteFromPlan(Long idPlan, Long idRutina) {
        Rutina r = rutinaRepository.findById(idRutina)
                .orElseThrow(() -> new IllegalArgumentException("Rutina no encontrada"));

        if (r.getPlan() == null || !r.getPlan().getId_plan().equals(idPlan)) {
            throw new IllegalArgumentException("La rutina no pertenece al plan indicado");
        }
        softDelete(idRutina);
    }
}