// backend/src/main/java/com/grindsup/backend/service/StatsService.java
package com.grindsup.backend.service;

import com.grindsup.backend.DTO.AltasBajasMesDTO;
import com.grindsup.backend.DTO.RatingBucketDTO;
import com.grindsup.backend.DTO.RatingMesDTO;
import com.grindsup.backend.repository.AlumnoRepository;
import com.grindsup.backend.repository.AlumnoRepository.MesCount;
import com.grindsup.backend.repository.PlanEvaluacionRepository;
import com.grindsup.backend.repository.PlanEvaluacionRepository.RatingBucket;
import com.grindsup.backend.repository.PlanEvaluacionRepository.RatingMes;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StatsService {

    private final AlumnoRepository alumnoRepository;
    private final PlanEvaluacionRepository planEvaluacionRepository;

    public StatsService(AlumnoRepository alumnoRepository,
                        PlanEvaluacionRepository planEvaluacionRepository) {
        this.alumnoRepository = alumnoRepository;
        this.planEvaluacionRepository = planEvaluacionRepository;
    }

    /* =======================
     * Alumnos
     * ======================= */

    public List<AltasBajasMesDTO> altasBajasPorMes(Long entrenadorId, LocalDate fromMonthIncl, LocalDate toMonthExcl) {
        Date from = Date.from(fromMonthIncl.atStartOfDay(ZoneId.systemDefault()).toInstant());
        Date to   = Date.from(toMonthExcl.atStartOfDay(ZoneId.systemDefault()).toInstant());

        List<MesCount> altas = alumnoRepository.altasPorMes(entrenadorId, from, to);
        List<MesCount> bajas = alumnoRepository.bajasPorMes(entrenadorId, from, to);

        Map<String, Long> mapAltas = altas.stream()
                .collect(Collectors.toMap(MesCount::getMonth, MesCount::getCnt));
        Map<String, Long> mapBajas = bajas.stream()
                .collect(Collectors.toMap(MesCount::getMonth, MesCount::getCnt));

        Set<String> meses = new TreeSet<>();
        meses.addAll(mapAltas.keySet());
        meses.addAll(mapBajas.keySet());

        List<AltasBajasMesDTO> out = new ArrayList<>();
        for (String m : meses) {
            out.add(new AltasBajasMesDTO(
                    m,
                    mapAltas.getOrDefault(m, 0L),
                    mapBajas.getOrDefault(m, 0L)
            ));
        }
        return out;
    }

    public List<AltasBajasMesDTO> activosFinDeMes(Long entrenadorId, LocalDate fromMonthIncl, LocalDate toMonthExcl) {
        Date from = Date.from(fromMonthIncl.atStartOfDay(ZoneId.systemDefault()).toInstant());
        Date to   = Date.from(toMonthExcl.atStartOfDay(ZoneId.systemDefault()).toInstant());

        List<MesCount> altas = alumnoRepository.altasPorMes(entrenadorId, from, to);
        List<MesCount> bajas = alumnoRepository.bajasPorMes(entrenadorId, from, to);

        Map<String, Long> altasMap = new HashMap<>();
        for (MesCount m : altas) altasMap.put(m.getMonth(), m.getCnt());
        Map<String, Long> bajasMap = new HashMap<>();
        for (MesCount m : bajas) bajasMap.put(m.getMonth(), m.getCnt());

        // activos antes del primer día del rango (corte exclusivo)
        long activos = Optional.ofNullable(
                alumnoRepository.countActivosAntesDe(
                        entrenadorId,
                        Date.from(fromMonthIncl.atStartOfDay(ZoneId.systemDefault()).toInstant())
                )
        ).orElse(0L);

        List<AltasBajasMesDTO> out = new ArrayList<>();
        LocalDate cursor = fromMonthIncl;
        DateTimeFormatter ym = DateTimeFormatter.ofPattern("yyyy-MM");
        while (cursor.isBefore(toMonthExcl)) {
            String key = cursor.format(ym);
            long a = Optional.ofNullable(altasMap.get(key)).orElse(0L);
            long b = Optional.ofNullable(bajasMap.get(key)).orElse(0L);
            activos = activos + a - b;

            out.add(new AltasBajasMesDTO(key, activos, 0L));
            cursor = cursor.plusMonths(1);
        }
        return out;
    }

    /* =======================
     * Planes – Ratings
     * ======================= */

    public List<RatingMesDTO> planesRatingMensual(Long entrenadorId, LocalDate fromIncl, LocalDate toExcl) {
        Date from = Date.from(fromIncl.atStartOfDay(ZoneId.systemDefault()).toInstant());
        Date to   = Date.from(toExcl.atStartOfDay(ZoneId.systemDefault()).toInstant());

        List<RatingMes> rows = planEvaluacionRepository.ratingPromedioMensual(entrenadorId, from, to);
        List<RatingMesDTO> out = new ArrayList<>();
        for (RatingMes r : rows) {
            out.add(new RatingMesDTO(
                    r.getMonth(),
                    r.getAvg() == null ? 0.0 : r.getAvg(),
                    r.getCnt() == null ? 0L   : r.getCnt()
            ));
        }
        return out;
    }

    public List<RatingBucketDTO> planesRatingDistribucion(Long entrenadorId, LocalDate fromIncl, LocalDate toExcl) {
        Date from = Date.from(fromIncl.atStartOfDay(ZoneId.systemDefault()).toInstant());
        Date to   = Date.from(toExcl.atStartOfDay(ZoneId.systemDefault()).toInstant());

        List<RatingBucket> rows = planEvaluacionRepository.ratingDistribucion(entrenadorId, from, to);
        // Normalizo a buckets 0..5
        Map<Integer, Long> m = new HashMap<>();
        for (RatingBucket r : rows) {
            m.put(r.getScore(), r.getCnt());
        }
        List<RatingBucketDTO> out = new ArrayList<>();
        for (int s = 0; s <= 5; s++) {
            out.add(new RatingBucketDTO(s, m.getOrDefault(s, 0L)));
        }
        return out;
    }
}
