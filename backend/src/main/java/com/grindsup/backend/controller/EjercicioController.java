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
public class EjercicioController {

    @Autowired
    private EjercicioRepository ejercicioRepository;

    @Autowired
    private EstadoRepository estadoRepository;

    @GetMapping
    public List<Ejercicio> getAll() {
        return ejercicioRepository.findAll();
    }

    @GetMapping("/{id}")
    public Ejercicio getById(@PathVariable Long id) {
        return ejercicioRepository.findById(id).orElse(null);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Ejercicio ejercicio) {
        if (ejercicio.getNombre() == null || ejercicio.getNombre().isBlank()) {
            return ResponseEntity.badRequest().body("El nombre del ejercicio es obligatorio.");
        }

        if (ejercicio.getEstado() != null) {
            Estado estado = estadoRepository.findById(ejercicio.getEstado().getId_estado()).orElse(null);
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
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Ejercicio ejercicio) {
        return ejercicioRepository.findById(id)
                .map(existing -> {
                    existing.setNombre(ejercicio.getNombre());
                    existing.setDescripcion(ejercicio.getDescripcion());
                    if (ejercicio.getEstado() != null) {
                        Estado estado = estadoRepository.findById(ejercicio.getEstado().getId_estado()).orElse(null);
                        existing.setEstado(estado);
                    }
                    existing.setUpdated_at(OffsetDateTime.now());
                    return ResponseEntity.ok(ejercicioRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        ejercicioRepository.deleteById(id);
        return "Ejercicio eliminado con id " + id;
    }
}
