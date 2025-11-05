package com.grindsup.backend.controller;

import com.grindsup.backend.model.PlanEvaluacion;
import com.grindsup.backend.repository.PlanEvaluacionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/planes")
@CrossOrigin
public class PlanEvaluacionController {

    private final PlanEvaluacionRepository repo;

    public PlanEvaluacionController(PlanEvaluacionRepository repo) {
        this.repo = repo;
    }

    // POST /api/planes/{idPlan}/evaluacion
    // Body: { id_entrenador, id_alumno, score(0..5), comentario? }
    @PostMapping("/{idPlan}/evaluacion")
    @ResponseStatus(HttpStatus.CREATED)
    public PlanEvaluacion crearEvaluacion(
            @PathVariable("idPlan") Long idPlan,
            @RequestBody PlanEvaluacion body
    ) {
        body.setId_plan(idPlan);

        if (body.getScore() == null || body.getScore() < 0 || body.getScore() > 5) {
            throw new IllegalArgumentException("score debe estar entre 0 y 5");
        }
        if (body.getId_entrenador() == null) {
            throw new IllegalArgumentException("id_entrenador es requerido");
        }
        if (body.getId_alumno() == null) {
            throw new IllegalArgumentException("id_alumno es requerido");
        }

        return repo.save(body);
    }

    // GET /api/planes/{idPlan}/evaluacion/count  -> { "count": N }
    @GetMapping("/{idPlan}/evaluacion/count")
    public Map<String, Long> contarEvaluaciones(@PathVariable("idPlan") Long idPlan) {
        Long c = repo.countByPlan(idPlan);
        return Map.of("count", c == null ? 0L : c);
    }
}
