// src/main/java/com/grindsup/backend/service/RutinaService.java
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

        // 1️⃣ Buscar rutina
        Rutina rutina = rutinaRepository.findById(idRutina)
                .orElseThrow(() -> new EntityNotFoundException("Rutina no encontrada con id: " + idRutina));

        // 2️⃣ Actualizar datos básicos
        rutina.setNombre(dto.getNombre());
        rutina.setDescripcion(dto.getDescripcion());
        // No es necesario guardar aquí, se guardará al final de la transacción

        // 3️⃣ Eliminar ejercicios antiguos (usando la query corregida)
        rutinaEjercicioRepository.deleteAllByRutinaId(idRutina);

        // 🔥 Forzar sincronización y limpiar el contexto de persistencia
        // (Esto es crucial para evitar errores de clave primaria en el saveAll)
        entityManager.flush();
        entityManager.clear();
        
        // 4️⃣ Volvemos a buscar la rutina porque el 'clear' la quitó del contexto
        Rutina rutinaRef = rutinaRepository.findById(idRutina)
                .orElseThrow(() -> new EntityNotFoundException("Rutina no encontrada post-clear: " + idRutina));

        // 5️⃣ Crear lista de nuevos ejercicios
        List<RutinaEjercicio> nuevosEjercicios = new ArrayList<>();

        if (dto.getEjercicios() != null) {
            for (RutinaEjercicioRequestDTO ejDto : dto.getEjercicios()) {

                Ejercicio ejercicio = ejercicioRepository.findById(ejDto.getIdEjercicio())
                        .orElseThrow(() -> new EntityNotFoundException("Ejercicio no encontrado con id: " + ejDto.getIdEjercicio()));

                RutinaEjercicio nuevoItem = new RutinaEjercicio();

                // --- CORRECCIÓN ---
                // Asignar solo las relaciones de objeto
                nuevoItem.setRutina(rutinaRef);
                nuevoItem.setEjercicio(ejercicio);

                // (Líneas eliminadas)
                // nuevoItem.setId_rutina(idRutina);
                // nuevoItem.setId_ejercicio(ejDto.getIdEjercicio());
                
                // Asignar el resto de los campos
                nuevoItem.setSeries(ejDto.getSeries());
                nuevoItem.setRepeticiones(ejDto.getRepeticiones());
                nuevoItem.setDescanso_segundos(ejDto.getDescansoSegundos());

                nuevosEjercicios.add(nuevoItem);
            }
        }

        // 6️⃣ Guardar nuevos ejercicios
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

        // Usamos la query corregida
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