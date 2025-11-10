// src/main/java/com/grindsup/backend/repository/PlanEvaluacionRepository.java
package com.grindsup.backend.repository;

import com.grindsup.backend.model.PlanEvaluacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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

    @Query(value = "SELECT COUNT(*) FROM plan_evaluacion WHERE id_plan = :planId", nativeQuery = true)
    Long countByPlan(@Param("planId") Long planId);

    // ✅ NUEVO: insert nativo para crear la evaluación
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
        INSERT INTO plan_evaluacion (id_plan, id_alumno, id_entrenador, score, comentario, created_at)
        VALUES (:p, :a, :e, :s, :c, NOW())
        """, nativeQuery = true)
    int insertEval(@Param("p") Long planId,
                   @Param("a") Long alumnoId,
                   @Param("e") Long entrenadorId,
                   @Param("s") Integer score,
                   @Param("c") String comentario);
}
