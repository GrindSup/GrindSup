// backend/src/main/java/com/grindsup/backend/controller/StatsController.java
package com.grindsup.backend.controller;

import com.grindsup.backend.DTO.AltasBajasMesDTO;
import com.grindsup.backend.DTO.RatingBucketDTO;
import com.grindsup.backend.DTO.RatingMesDTO;
import com.grindsup.backend.service.StatsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    /* ===== Alumnos ===== */

    @GetMapping("/alumnos/altas-bajas")
    public List<AltasBajasMesDTO> altasBajas(
            @RequestParam Long entrenadorId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth from,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth to
    ) {
        LocalDate fromDate = from.atDay(1);
        LocalDate toDateExcl = to.plusMonths(1).atDay(1); // 'to' inclusivo
        return statsService.altasBajasPorMes(entrenadorId, fromDate, toDateExcl);
    }

    @GetMapping("/alumnos/activos-fin-de-mes")
    public List<AltasBajasMesDTO> activosFinDeMes(
            @RequestParam Long entrenadorId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth from,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth to
    ) {
        LocalDate fromDate = from.atDay(1);
        LocalDate toDateExcl = to.plusMonths(1).atDay(1);
        return statsService.activosFinDeMes(entrenadorId, fromDate, toDateExcl);
    }

    /* ===== Planes – Ratings ===== */

    // ⛳️ EXACTAMENTE como espera el front:
    // GET /api/stats/planes/rating-mensual?entrenadorId=...&from=YYYY-MM&to=YYYY-MM
    @GetMapping("/planes/rating-mensual")
    public List<RatingMesDTO> planesRatingMensual(
            @RequestParam Long entrenadorId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth from,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth to
    ) {
        LocalDate fromDate = from.atDay(1);
        LocalDate toDateExcl = to.plusMonths(1).atDay(1);
        return statsService.planesRatingMensual(entrenadorId, fromDate, toDateExcl);
    }

    // GET /api/stats/planes/rating-distribucion?entrenadorId=...&from=YYYY-MM&to=YYYY-MM
    @GetMapping("/planes/rating-distribucion")
    public List<RatingBucketDTO> planesRatingDistribucion(
            @RequestParam Long entrenadorId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth from,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth to
    ) {
        LocalDate fromDate = from.atDay(1);
        LocalDate toDateExcl = to.plusMonths(1).atDay(1);
        return statsService.planesRatingDistribucion(entrenadorId, fromDate, toDateExcl);
    }
}
