package com.grindsup.backend.controller;

import com.grindsup.backend.model.Ejercicio;
import com.grindsup.backend.model.Estado;
import com.grindsup.backend.repository.EjercicioRepository;
import com.grindsup.backend.repository.EstadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/ejercicios")
@CrossOrigin(origins = "*")
public class EjercicioController {

    @Autowired
    private EjercicioRepository ejercicioRepository;

    @Autowired
    private EstadoRepository estadoRepository;

    @GetMapping
    public List<Ejercicio> getAll() {
        return ejercicioRepository.findAll()
                .stream()
                .filter(e -> e.getDeleted_at() == null) // solo activos
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return ejercicioRepository.findById(id)
                .filter(e -> e.getDeleted_at() == null) // solo si no está eliminado
                .map(e -> ResponseEntity.ok(e))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Ejercicio ejercicio) {
        if (ejercicio.getNombre() == null || ejercicio.getNombre().isBlank()) {
            return ResponseEntity.badRequest().body("El nombre del ejercicio es obligatorio.");
        }

        if (ejercicio.getEstado() != null) {
            Estado estado = estadoRepository.findById(ejercicio.getEstado().getIdEstado()).orElse(null);
            if (estado == null)
                return ResponseEntity.badRequest().body("El estado indicado no existe.");
            ejercicio.setEstado(estado);
        }

        ejercicio.setCreated_at(OffsetDateTime.now());
        ejercicio.setUpdated_at(OffsetDateTime.now());

        Ejercicio guardado = ejercicioRepository.save(ejercicio);
        return ResponseEntity.status(201).body(guardado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Ejercicio ejercicioDetails) {
        if (ejercicioDetails.getNombre() == null || ejercicioDetails.getNombre().isBlank()) {
            return ResponseEntity.badRequest().body("El nombre del ejercicio es obligatorio.");
        }
        return ejercicioRepository.findById(id)
                .map(existing -> {
                    existing.setNombre(ejercicioDetails.getNombre());
                    existing.setDescripcion(ejercicioDetails.getDescripcion());
                    existing.setDificultad(ejercicioDetails.getDificultad());
                    existing.setGrupoMuscularPrincipal(ejercicioDetails.getGrupoMuscularPrincipal());
                    existing.setGrupoMuscularSecundario(ejercicioDetails.getGrupoMuscularSecundario());
                    existing.setEquipamiento(ejercicioDetails.getEquipamiento());

                    if (ejercicioDetails.getEstado() != null) {
                        Estado estado = estadoRepository.findById(ejercicioDetails.getEstado().getIdEstado())
                                .orElse(null);
                        existing.setEstado(estado);
                    }
                    existing.setUpdated_at(OffsetDateTime.now());

                    Ejercicio actualizado = ejercicioRepository.save(existing);
                    return ResponseEntity.ok(actualizado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return ejercicioRepository.findById(id)
                .map(ejercicio -> {
                    ejercicio.setDeleted_at(OffsetDateTime.now());
                    ejercicioRepository.save(ejercicio);
                    return ResponseEntity.ok("Ejercicio eliminado correctamente");
                })
                .orElse(ResponseEntity.notFound().build());
    }
}