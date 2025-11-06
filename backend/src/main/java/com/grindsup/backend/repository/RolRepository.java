package com.grindsup.backend.repository;

import com.grindsup.backend.model.Rol;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional; // Necesitas importar Optional

public interface RolRepository extends JpaRepository<Rol, Long> {

    /**
     * Busca un Rol por su nombre, ignorando el caso (mayúsculas/minúsculas).
     * Este método es requerido por CustomOAuth2UserService para encontrar el rol por defecto.
     */
    Optional<Rol> findByNombreIgnoreCase(String nombre);
}