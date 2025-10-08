// backend/src/main/java/com/grindsup/backend/repository/AlumnoRepository.java
package com.grindsup.backend.repository;

import com.grindsup.backend.model.Alumno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AlumnoRepository extends JpaRepository<Alumno, Long> {

    // Solo activos (sin baja lógica)
    List<Alumno> findByDeletedAtIsNull();

    // Solo eliminados
    List<Alumno> findByDeletedAtIsNotNull();

    Optional<Alumno> findByDocumento(String documento);

    @Query("""
           select a
           from Alumno a
           where a.deletedAt is null
             and a.entrenador.id_entrenador = :entrenadorId
           """)
    List<Alumno> findActivosByEntrenador(@Param("entrenadorId") Long entrenadorId);
}

