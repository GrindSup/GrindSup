package com.grindsup.backend.controller;

import com.grindsup.backend.service.PlanStatsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stats/planes")
@CrossOrigin
public class PlanStatsController {

    private final PlanStatsService stats;

    public PlanStatsController(PlanStatsService stats) {
        this.stats = stats;
    }

    // GET /api/stats/planes/ratings-mensual?entrenadorId=3&from=2025-11&to=2025-11
    @GetMapping("/ratings-mensual")
    public List<Map<String,Object>> ratingsMensual(
            @RequestParam Long entrenadorId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth from,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth to
    ) {
        LocalDate f   = from.atDay(1);
        LocalDate tEx = to.plusMonths(1).atDay(1); // 'to' inclusivo
        return stats.ratingsMensual(entrenadorId, f, tEx);
    }

    // GET /api/stats/planes/ratings-distribucion?entrenadorId=3&from=2025-11&to=2025-11
    @GetMapping("/ratings-distribucion")
    public List<Map<String,Object>> ratingsDistribucion(
            @RequestParam Long entrenadorId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth from,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth to
    ) {
        LocalDate f   = from.atDay(1);
        LocalDate tEx = to.plusMonths(1).atDay(1);
        return stats.ratingsDistribucion(entrenadorId, f, tEx);
    }
}
