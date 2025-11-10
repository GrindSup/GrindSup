// backend/src/main/java/com/grindsup/backend/controller/PlanEvaluacionController.java
package com.grindsup.backend.controller;

import com.grindsup.backend.model.PlanEntrenamiento;
import com.grindsup.backend.model.PlanEvaluacion;
import com.grindsup.backend.repository.PlanEntrenamientoRepository;
import com.grindsup.backend.repository.PlanEvaluacionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.grindsup.backend.DTO.CrearPlanEvaluacionDTO;

import java.time.OffsetDateTime;
import java.util.Date;
import java.util.Map;

@RestController
@RequestMapping("/api/planes")
@CrossOrigin
public class PlanEvaluacionController {

    private final PlanEntrenamientoRepository planRepo;
    private final PlanEvaluacionRepository evalRepo;

    public PlanEvaluacionController(
            PlanEntrenamientoRepository planRepo,
            PlanEvaluacionRepository evalRepo
    ) {
        this.planRepo = planRepo;
        this.evalRepo = evalRepo;
    }

    // POST /api/planes/{idPlan}/evaluacion
        @PostMapping("/{idPlan}/evaluacion")
    public ResponseEntity<?> crearEvaluacion(
            @PathVariable Long idPlan,
            @RequestBody CrearPlanEvaluacionDTO body
    ) {
        PlanEntrenamiento plan = planRepo.findById(idPlan)
                .orElseThrow(() -> new IllegalArgumentException("Plan no encontrado: " + idPlan));

        Integer score = body.getScore();
        if (score == null || score < 1 || score > 5) {
            return ResponseEntity.badRequest().body(Map.of("error", "score debe ser 1..5"));
        }

        PlanEvaluacion ev = new PlanEvaluacion();
        ev.setId_plan(idPlan);
        ev.setId_alumno(plan.getAlumno() != null ? plan.getAlumno().getId_alumno() : null);

        ev.setId_entrenador(
                (plan.getAlumno() != null && plan.getAlumno().getEntrenador() != null)
                        ? plan.getAlumno().getEntrenador().getIdEntrenador()
                        : body.getId_entrenador()
        );

        ev.setScore(score);
        ev.setComentario(body.getComentario());
        ev.setCreated_at(new java.util.Date());

        PlanEvaluacion saved = evalRepo.save(ev);
        return ResponseEntity.ok(Map.of("evaluacion", saved));
    }


    // GET /api/planes/{idPlan}/evaluacion/count -> {count:n}
    @GetMapping("/{idPlan}/evaluacion/count")
    public ResponseEntity<?> contarEvaluaciones(@PathVariable Long idPlan) {
        Long cnt = evalRepo.countByPlan(idPlan);
        return ResponseEntity.ok(Map.of("count", cnt));
    }
}
