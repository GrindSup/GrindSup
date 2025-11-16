package com.grindsup.backend.repository;

import com.grindsup.backend.model.Rutina;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RutinaRepository extends JpaRepository<Rutina, Long> {

    @Query("""
            SELECT r
            FROM Rutina r
            WHERE r.deleted_at IS NULL
              AND r.plan IS NULL
              AND r.rutinaBase IS NULL
            ORDER BY r.created_at DESC
            """)
    List<Rutina> findDisponiblesParaEntrenador();

    @Query("""
            SELECT r
            FROM Rutina r
            WHERE r.deleted_at IS NULL
              AND r.plan.id_plan = :idPlan
            ORDER BY r.created_at DESC
            """)
    List<Rutina> findByPlanId(@Param("idPlan") Long idPlan);

    @Query("""
            SELECT r
            FROM Rutina r
            LEFT JOIN r.plan p
            WHERE r.deleted_at IS NULL
              AND (
                    p.entrenador.id = :entrenadorId
                    OR (r.plan IS NULL AND r.rutinaBase IS NULL)
                  )
            ORDER BY r.created_at DESC
            """)
    List<Rutina> findAllByEntrenadorOrPublicTemplates(@Param("entrenadorId") Long entrenadorId);
}
