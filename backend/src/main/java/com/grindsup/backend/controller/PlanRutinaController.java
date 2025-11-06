package com.grindsup.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.grindsup.backend.model.PlanEntrenamiento;
import com.grindsup.backend.model.Rutina;
import com.grindsup.backend.model.RutinaEjercicio;
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
    private com.grindsup.backend.service.RutinaService rutinaService;

    // ==========================
    // Listar rutinas de un plan
    // ==========================
    @GetMapping
    public List<Rutina> listarRutinasPorPlan(@PathVariable Long idPlan) {
        PlanEntrenamiento plan = planRepository.findById(idPlan)
                .orElseThrow(() -> new RuntimeException("Plan no encontrado"));
        
        return rutinaRepository.findAll()
                .stream()
                .filter(r -> r.getDeleted_at() == null && // <-- ¡FILTRO AÑADIDO!
                             r.getPlan() != null && 
                             r.getPlan().getId_plan().equals(plan.getId_plan()))
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
        rutinaService.softDeleteFromPlan(idPlan, idRutina);
        return ResponseEntity.noContent().build();
    }

    // Alias opcional si querés aceptar POST .../delete
    @PostMapping("/{idRutina}/delete")
    public ResponseEntity<Void> deleteFromPlanAlias(@PathVariable Long idPlan, @PathVariable Long idRutina) {
        rutinaService.softDeleteFromPlan(idPlan, idRutina);
        return ResponseEntity.noContent().build();
    }
}