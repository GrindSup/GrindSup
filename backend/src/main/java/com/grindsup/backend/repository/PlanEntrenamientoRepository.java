package com.grindsup.backend.repository;
import com.grindsup.backend.model.PlanEntrenamiento;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlanEntrenamientoRepository extends JpaRepository<PlanEntrenamiento, Long> {
    List<PlanEntrenamiento> findByAlumno_IdAlumno(Long idAlumno);
    List<PlanEntrenamiento> findByEntrenador_IdEntrenador(Long idEntrenador);
}
