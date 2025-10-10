package com.grindsup.backend.repository;

import com.grindsup.backend.model.TipoTurno;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
public interface TipoTurnoRepository extends JpaRepository<TipoTurno, Long> {
    Optional<TipoTurno> findByNombre(String nombre);
}
