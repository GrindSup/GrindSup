package com.grindsup.backend.repository;

import com.grindsup.backend.model.PlanEvaluacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Date;
import java.util.List;

public interface PlanEvaluacionRepository extends JpaRepository<PlanEvaluacion, Long> {

    interface RatingMes {
        String getMonth();
        Double getAvg();
        Long getCnt();
    }

    interface RatingBucket {
        Integer getScore();
        Long getCnt();
    }

    @Query(value = """
        SELECT DATE_FORMAT(e.created_at, '%Y-%m') AS month,
               AVG(e.score) AS avg,
               COUNT(*)     AS cnt
        FROM plan_evaluacion e
        WHERE e.id_entrenador = :entrenadorId
          AND e.created_at BETWEEN :from AND :to
        GROUP BY month
        ORDER BY month
        """, nativeQuery = true)
    List<RatingMes> ratingPromedioMensual(@Param("entrenadorId") Long entrenadorId,
                                          @Param("from") Date from,
                                          @Param("to")   Date to);

    @Query(value = """
        SELECT e.score AS score, COUNT(*) AS cnt
        FROM plan_evaluacion e
        WHERE e.id_entrenador = :entrenadorId
          AND e.created_at BETWEEN :from AND :to
        GROUP BY e.score
        ORDER BY e.score
        """, nativeQuery = true)
    List<RatingBucket> ratingDistribucion(@Param("entrenadorId") Long entrenadorId,
                                          @Param("from") Date from,
                                          @Param("to")   Date to);

    // ---- NUEVO: contar evaluaciones por plan ----
    @Query(value = "SELECT COUNT(*) FROM plan_evaluacion WHERE id_plan = :planId", nativeQuery = true)
    Long countByPlan(@Param("planId") Long planId);
}
