package com.grindsup.backend.controller;

import com.grindsup.backend.model.RutinaEjercicio;
import com.grindsup.backend.model.RutinaEjercicioId;
import com.grindsup.backend.model.Rutina;
import com.grindsup.backend.model.Ejercicio;
import com.grindsup.backend.model.Estado;
import com.grindsup.backend.repository.RutinaEjercicioRepository;
import com.grindsup.backend.repository.RutinaRepository;
import com.grindsup.backend.repository.EjercicioRepository;
import com.grindsup.backend.repository.EstadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rutina-ejercicios")
public class RutinaEjercicioController {

    @Autowired
    private RutinaEjercicioRepository repository;

    @Autowired
    private RutinaRepository rutinaRepository;

    @Autowired
    private EjercicioRepository ejercicioRepository;

    @Autowired
    private EstadoRepository estadoRepository;

    @GetMapping
    public List<RutinaEjercicio> getAll() {
        return repository.findAll();
    }

    @GetMapping("/{rutinaId}/{ejercicioId}")
    public RutinaEjercicio getById(@PathVariable Long rutinaId, @PathVariable Long ejercicioId) {
        return repository.findById(new RutinaEjercicioId(rutinaId, ejercicioId)).orElse(null);
    }

    @PostMapping
    public RutinaEjercicio create(@RequestBody RutinaEjercicio re) {
        if (re.getRutina() != null) {
            Rutina rutina = rutinaRepository.findById(re.getRutina().getId_rutina()).orElse(null);
            re.setRutina(rutina);
        }
        if (re.getEjercicio() != null) {
            Ejercicio ejercicio = ejercicioRepository.findById(re.getEjercicio().getId_ejercicio()).orElse(null);
            re.setEjercicio(ejercicio);
        }
        if (re.getEstado() != null) {
            Estado estado = estadoRepository.findById(re.getEstado().getIdEstado()).orElse(null);
            re.setEstado(estado);
        }
        return repository.save(re);
    }

    @DeleteMapping("/{rutinaId}/{ejercicioId}")
    public String delete(@PathVariable Long rutinaId, @PathVariable Long ejercicioId) {
        repository.deleteById(new RutinaEjercicioId(rutinaId, ejercicioId));
        return "RutinaEjercicio eliminado";
    }
}
