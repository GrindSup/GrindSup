package com.grindsup.backend.repository;

import com.grindsup.backend.model.TurnoAlumno;
import com.grindsup.backend.model.TurnoAlumnoId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TurnoAlumnoRepository extends JpaRepository<TurnoAlumno, TurnoAlumnoId> {
}
