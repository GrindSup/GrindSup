package com.grindsup.backend.repository;

import com.grindsup.backend.model.Alumno;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AlumnoRepository extends JpaRepository<Alumno, Long> {
    // Solo activos
    List<Alumno> findByDeletedAtIsNull();

    // Solo eliminados
    List<Alumno> findByDeletedAtIsNotNull();
}
