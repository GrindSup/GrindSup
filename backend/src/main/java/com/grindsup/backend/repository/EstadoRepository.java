package com.grindsup.backend.repository;

import com.grindsup.backend.model.Estado;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EstadoRepository extends JpaRepository<Estado, Long> {

    // 🔍 permite buscar estados sin importar mayúsculas/minúsculas
    Optional<Estado> findByNombreIgnoreCase(String nombre);
}
