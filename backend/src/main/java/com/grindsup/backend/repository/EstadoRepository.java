package com.grindsup.backend.repository;

import com.grindsup.backend.model.Estado;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EstadoRepository extends JpaRepository<Estado, Long> {
    Optional<Estado> findByNombreIgnoreCase(String nombre);
}