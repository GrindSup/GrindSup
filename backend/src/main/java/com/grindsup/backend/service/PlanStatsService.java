package com.grindsup.backend.service;

import com.grindsup.backend.repository.PlanEvaluacionRepository;
import com.grindsup.backend.repository.PlanEvaluacionRepository.RatingBucket;
import com.grindsup.backend.repository.PlanEvaluacionRepository.RatingMes;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

@Service
public class PlanStatsService {

    private final PlanEvaluacionRepository evalRepo;

    public PlanStatsService(PlanEvaluacionRepository evalRepo) {
        this.evalRepo = evalRepo;
    }

    private Date d(LocalDate ld) {
        return Date.from(ld.atStartOfDay(ZoneId.systemDefault()).toInstant());
    }

    /** Devuelve [{ month, avg, count }] */
    public List<Map<String,Object>> ratingsMensual(Long entId, LocalDate fromIncl, LocalDate toExcl) {
        List<RatingMes> rows = evalRepo.ratingPromedioMensual(entId, d(fromIncl), d(toExcl));
        List<Map<String,Object>> out = new ArrayList<>();
        for (RatingMes r : rows) {
            Map<String,Object> m = new HashMap<>();
            m.put("month", r.getMonth());
            m.put("avg",   r.getAvg());
            m.put("count", r.getCnt());
            out.add(m);
        }
        return out;
    }

    /** Buckets 0..5 → [{ score, count }] (incluye los vacíos) */
    public List<Map<String,Object>> ratingsDistribucion(Long entId, LocalDate fromIncl, LocalDate toExcl) {
        List<RatingBucket> rows = evalRepo.ratingDistribucion(entId, d(fromIncl), d(toExcl));
        Map<Integer,Long> map = new HashMap<>();
        for (RatingBucket b : rows) map.put(b.getScore(), b.getCnt());

        List<Map<String,Object>> out = new ArrayList<>();
        for (int s = 0; s <= 5; s++) {
            Map<String,Object> m = new HashMap<>();
            m.put("score", s);
            m.put("count", map.getOrDefault(s, 0L));
            out.add(m);
        }
        return out;
    }
}
