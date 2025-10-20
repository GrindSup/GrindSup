package com.grindsup.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.grindsup.backend.DTO.CrearRutinarequestDTO;
import com.grindsup.backend.DTO.EjercicioRutinaDTO;
import com.grindsup.backend.model.Ejercicio;
import com.grindsup.backend.model.Estado;
import com.grindsup.backend.model.PlanEntrenamiento;
import com.grindsup.backend.model.Rutina;
import com.grindsup.backend.model.RutinaEjercicio;
import com.grindsup.backend.repository.EjercicioRepository;
import com.grindsup.backend.repository.EstadoRepository;
import com.grindsup.backend.repository.PlanEntrenamientoRepository;
import com.grindsup.backend.repository.RutinaEjercicioRepository;
import com.grindsup.backend.repository.RutinaRepository;

@RestController
@RequestMapping("/api/planes/{idPlan}/rutinas")
@CrossOrigin(origins = "*")
public class PlanRutinaController {

    @Autowired
    private PlanEntrenamientoRepository planRepository;

    @Autowired
    private RutinaRepository rutinaRepository;

    @Autowired
    private RutinaEjercicioRepository rutinaEjercicioRepository;

    @Autowired
    private EjercicioRepository ejercicioRepository;

    @Autowired
    private EstadoRepository estadoRepository;

    // ==========================
    // Listar rutinas de un plan
    // ==========================
    @GetMapping
    public List<Rutina> listarRutinasPorPlan(@PathVariable Long idPlan) {
        // Si tenés el método en el repository, usalo:
        // return rutinaRepository.findByPlan_Id_plan(idPlan);

        PlanEntrenamiento plan = planRepository.findById(idPlan)
                .orElseThrow(() -> new RuntimeException("Plan no encontrado"));
        return rutinaRepository.findAll()
                .stream()
                .filter(r -> r.getPlan() != null && r.getPlan().getId_plan().equals(plan.getId_plan()))
                .toList();
    }

    // ==========================
    // Obtener detalle de rutina
    // ==========================
    @GetMapping("/{idRutina}/detalle")
    public ResponseEntity<?> getRutinaDetalle(@PathVariable Long idPlan, @PathVariable Long idRutina) {
        Rutina rutina = rutinaRepository.findById(idRutina)
                .orElseThrow(() -> new RuntimeException("Rutina no encontrada"));

        if (rutina.getPlan() == null || !rutina.getPlan().getId_plan().equals(idPlan)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("La rutina no pertenece al plan indicado");
        }

        List<RutinaEjercicio> ejercicios = rutinaEjercicioRepository.findAllByRutinaId(idRutina)
                .stream()
                .filter(re -> re.getDeleted_at() == null)
                .toList();

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("rutina", rutina);
        resultado.put("ejercicios", ejercicios);

        return ResponseEntity.ok(resultado);
    }

    // ==========================
    // Eliminar rutina del plan
    // ==========================
    @DeleteMapping("/{idRutina}")
    public ResponseEntity<Void> deleteFromPlan(@PathVariable Long idPlan, @PathVariable Long idRutina) {
        Rutina rutina = rutinaRepository.findById(idRutina)
                .orElseThrow(() -> new RuntimeException("Rutina no encontrada"));

        if (rutina.getPlan() == null || !rutina.getPlan().getId_plan().equals(idPlan)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        // Primero borro las asociaciones rutina-ejercicio
        rutinaEjercicioRepository.deleteAllByRutinaId(idRutina);
        // Luego la rutina
        rutinaRepository.deleteById(idRutina);

        return ResponseEntity.noContent().build();
    }

    // Alias opcional si querés aceptar POST .../delete
    @PostMapping("/{idRutina}/delete")
    public ResponseEntity<Void> deleteFromPlanAlias(@PathVariable Long idPlan, @PathVariable Long idRutina) {
        return deleteFromPlan(idPlan, idRutina);
    }
}
