package com.grindsup.backend.repository;

import com.grindsup.backend.model.Sesion;
import com.grindsup.backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SesionRepository extends JpaRepository<Sesion, Long> {

    /**
     * Todas las sesiones de un usuario (entrenador) específico.
     */
    List<Sesion> findByUsuario(Usuario usuario);

    /**
     * Todas las sesiones de una lista de usuarios (entrenadores).
     */
    @Query("SELECT s FROM Sesion s WHERE s.usuario IN :usuarios")
    List<Sesion> findByUsuarios(@Param("usuarios") List<Usuario> usuarios);
}
