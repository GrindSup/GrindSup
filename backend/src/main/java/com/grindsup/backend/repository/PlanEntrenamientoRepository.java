package com.grindsup.backend.repository;

import com.grindsup.backend.DTO.PlanListDTO; 
import com.grindsup.backend.model.PlanEntrenamiento;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PlanEntrenamientoRepository extends JpaRepository<PlanEntrenamiento, Long> {

    // 1. Consultas derivadas por Alumno y Estado
    List<PlanEntrenamiento> findByAlumno_IdAlumno(Long idAlumno);

    List<PlanEntrenamiento> findByAlumno_IdAlumnoAndEstado_IdEstado(Long idAlumno, Long idEstado);
    
    // Consulta derivada por nombre de estado (ya está bien)
    List<PlanEntrenamiento> findByAlumno_IdAlumnoAndEstado_Nombre(Long idAlumno, String nombreEstado); 

    // 2. Consulta derivada por Estado (general)
    List<PlanEntrenamiento> findByEstado_IdEstado(Long idEstado);

    
    // 3. Consulta para obtener la entidad PlanEntrenamiento COMPLETA por Entrenador ID (Mantenemos esta y eliminamos la duplicada/ambigua)
    @Query("""
        select p
        from PlanEntrenamiento p
        where p.entrenador.idEntrenador = :entrenadorId
        """)
    // Hemos renombrado para evitar ambigüedad con el método sin @Query.
    List<PlanEntrenamiento> findPlansByEntrenadorId(@Param("entrenadorId") Long entrenadorId);


    // ✅ 4. MÉTODO DE PROYECCIÓN DTO (Para la lista del frontend)
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