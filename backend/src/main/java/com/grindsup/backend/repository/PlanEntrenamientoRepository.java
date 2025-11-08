package com.grindsup.backend.repository;
import com.grindsup.backend.model.PlanEntrenamiento;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlanEntrenamientoRepository extends JpaRepository<PlanEntrenamiento, Long> {
    List<PlanEntrenamiento> findByAlumno_IdAlumno(Long idAlumno);
    List<PlanEntrenamiento> findByEntrenador_idEntrenador(Long idEntrenador);
    List<PlanEntrenamiento> findByAlumno_IdAlumnoAndEstado_IdEstado(Long idAlumno, Long idEstado);
    List<PlanEntrenamiento> findByAlumno_IdAlumnoAndEstado_nombre(Long idAlumno, String nombreEstado);
    List<PlanEntrenamiento> findByEstado_IdEstado(Long idEstado);
}
