package com.grindsup.backend.repository;

import com.grindsup.backend.DTO.PlanListDTO; 
import com.grindsup.backend.model.PlanEntrenamiento;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PlanEntrenamientoRepository extends JpaRepository<PlanEntrenamiento, Long> {

    List<PlanEntrenamiento> findByAlumno_IdAlumno(Long idAlumno);

    List<PlanEntrenamiento> findByAlumno_IdAlumnoAndEstado_IdEstado(Long idAlumno, Long idEstado);

    List<PlanEntrenamiento> findByEstado_IdEstado(Long idEstado);

    // Mantenemos el método que devuelve la entidad PlanEntrenamiento completa, pero corregido para usar el mapeo directo:
    @Query("""
        select p
        from PlanEntrenamiento p
        where p.entrenador.idEntrenador = :entrenadorId
        """)
    List<PlanEntrenamiento> findByEntrenador_IdEntrenador(@Param("entrenadorId") Long entrenadorId);


    // ✅ MÉTODO DE PROYECCIÓN DTO (CORREGIDO FINALMENTE)
    // Selecciona campos para el DTO. Accede al ID del plan como 'p.id_plan' y al entrenador como 'p.entrenador.idEntrenador'.
    @Query("""
        SELECT new com.grindsup.backend.DTO.PlanListDTO(
             p.id_plan, p.objetivo, p.fecha_inicio, p.fecha_fin, 
             p.alumno.idAlumno, p.alumno.nombre, p.alumno.apellido,
             p.estado.idEstado, p.estado.nombre, p.created_at
        )
        FROM PlanEntrenamiento p
        WHERE p.entrenador.idEntrenador = :entrenadorId 
    """)
    List<PlanListDTO> findPlanDTOByEntrenador(@Param("entrenadorId") Long entrenadorId);
}